import "dotenv/config";
import { and, eq } from "drizzle-orm";
import * as cheerio from "cheerio";
import { parseBuffer } from "music-metadata";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { songs, users } from "@/lib/db/schema";

const utapi = new UTApi();
const BASE_URL = "https://ncs.io";
const NUM_PAGES = 5;

async function scrapeNCS() {
  // Find song links from multiple pages
  const songLinks: string[] = [];
  
  for (let page = 1; page <= NUM_PAGES; page++) {
    const pageUrl = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
    console.log(`Fetching page ${page}: ${pageUrl}`);
    
    const mainRes = await fetch(pageUrl);
    const mainHtml = await mainRes.text();
    const $ = cheerio.load(mainHtml);

    // Find song links on this page
    $('body > main > article.module.artists > div > div:nth-child(4) a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        songLinks.push(BASE_URL + href);
      }
    });
  }

  console.log(`Found ${songLinks.length} songs across ${NUM_PAGES} pages`);

  // Get all users
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    throw new Error("No users found in database. Please create at least one user first.");
  }

  for (const songUrl of songLinks) {
    try {
      const songRes = await fetch(songUrl);
      const songHtml = await songRes.text();
      const $$ = cheerio.load(songHtml);

      // Get iframe src for song details
      const iframe = $$('body > main > article > div > div > div.col-lg-5.platforms > iframe');
      const iframeSrc = iframe.attr('src');
      if (!iframeSrc) {
        console.log(`Skipping ${songUrl}: no iframe found`);
        continue;
      }
      const iframeUrl = iframeSrc.startsWith('http') ? iframeSrc : BASE_URL + iframeSrc;

      // Fetch iframe page
      const iframeRes = await fetch(iframeUrl);
      const iframeHtml = await iframeRes.text();
      const $$$ = cheerio.load(iframeHtml);

      // Extract data from script tag
      const scriptTag = $$$('#linkfire-widget-data');
      const scriptContent = scriptTag.text();

      const artistMatch = scriptContent.match(/artistName:\s*"([^"]+)"/);
      const albumMatch = scriptContent.match(/albumName:\s*"([^"]+)"/);
      const artworkMatch = scriptContent.match(/artwork:\s*"([^"]+)"/);
      const durationMatch = scriptContent.match(/duration:\s*(\d+)/);

      const title = albumMatch ? JSON.parse('"' + albumMatch[1] + '"') : null;
      const artist = artistMatch ? JSON.parse('"' + artistMatch[1] + '"') : null;
      const coverUrl = artworkMatch ? JSON.parse('"' + artworkMatch[1] + '"') : null;
      const durationFromScript = durationMatch ? parseInt(durationMatch[1]) : undefined;

      // Audio URL from original page
      const audioA = $$('body > main > article > div > div > div.col-lg-7.o-hidden > section > div > div > div:nth-child(3) > a');
      const audioHref = audioA.attr('href');
      const audioUrl = audioHref ? BASE_URL + audioHref : null;
      

      if (!title || !artist || !audioUrl) {
        console.log(`Skipping ${songUrl}: missing title, artist, or audio URL`);
        continue;
      }

      // Check if song already exists
      const existingSong = await db
        .select()
        .from(songs)
        .where(and(eq(songs.title, title), eq(songs.artist, artist)))
        .limit(1);

      if (existingSong[0]) {
        console.log(`Song "${title}" by ${artist} already exists`);
        continue;
      }

      // Download audio for duration parsing
      const audioRes = await fetch(audioUrl);
      const audioBlob = await audioRes.blob();
      const audioFile = new File([audioBlob], `${title}.mp3`, { type: 'audio/mpeg' });

      // Parse duration
      let duration: number | undefined;
      try {
        const audioBuffer = await audioFile.arrayBuffer();
        const metadata = await parseBuffer(new Uint8Array(audioBuffer), { mimeType: 'audio/mpeg' });
        duration = Math.round(metadata.format.duration || 0);
      } catch (error) {
        console.warn(`Could not parse metadata for ${title}:`, error);
      }

      // Upload audio from URL
      const audioUpload = await utapi.uploadFilesFromUrl({
        url: audioUrl,
        name: `${title} - ${artist}.mp3`
      });
      if (!audioUpload.data) {
        console.error(`Failed to upload audio for ${title}`);
        continue;
      }
      const { ufsUrl: fileUrl, key: fileKey } = audioUpload.data;

      let coverArtUrl: string | undefined;
      let coverArtKey: string | undefined;

      if (coverUrl) {
        // Upload cover from URL
        const coverUpload = await utapi.uploadFilesFromUrl({
          url: coverUrl,
          name: `cover-${title}.jpg`
        });
        if (coverUpload.data) {
          coverArtUrl = coverUpload.data.ufsUrl;
          coverArtKey = coverUpload.data.key;
          console.log(`Uploaded cover art for ${title}`);
        }
      }

      // Randomly select a user
      const randomIndex = Math.floor(Math.random() * allUsers.length);
      const selectedUser = allUsers[randomIndex];

      // Insert into database
      await db.insert(songs).values({
        title,
        artist,
        fileUrl,
        fileKey,
        coverArtUrl,
        coverArtKey,
        duration,
        userId: selectedUser.id,
      });

      console.log(`Seeded "${title}" by ${artist} (${duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : 'unknown duration'})${coverArtUrl ? ' with cover art' : ''} (uploaded by ${selectedUser.username})`);
    } catch (error) {
      console.error(`Error processing ${songUrl}:`, error);
    }
  }

  console.log("Scraping and seeding completed");
}

// Run the scraper
scrapeNCS().catch(console.error);