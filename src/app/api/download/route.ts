import fs from "fs";
import path from "path";
import archiver from "archiver";

const ACCESS_TOKEN = `EAASu7wQRZBeQBOwvvBieH0HA72Tr8ZAgshwYmaTxPfNZCsVQAO6xTqxGDFgMqpHPZBCw4BNLF2PChkajyEcxTT8o62kZCUuxL9lam731F5in7h5uoQ9RmLZAB4TbgcznRwNbt1tQn4DYDhCOLO0gPdPiTZB8ZBAW8e5QnZCbDhxBF1GhHe8oQ0nCrfZAwesX6xWdBpcg8WNitcCQZDZD`;
const FIELDS =
  "{username,profile_picture_url," + "media.limit(0){media_type,media_url}}";

export const POST = async (req: Request) => {
  const { username } = await req.json();
  const PART_LINK = `17841458467361823?fields=business_discovery.username(${username})${FIELDS}`;
  const URL = `https://graph.facebook.com/${PART_LINK}&access_token=${ACCESS_TOKEN}`;
  try {
    const res = await fetch(URL);
    const data = await res.json();

    if (data.error) throw new Error(data.error.error_user_msg);

    const parsedData = data.business_discovery;
    const videos = parsedData.media.data
      .filter((m: any) => m.media_type === "VIDEO" && m.media_url)
      .map((m: any) => m.media_url);

    if (!videos.length) throw new Error("There are not vieos on this account");

    const DOWNLOAD_FOLDER_PATH = path.resolve(`public/downloads/${username}`);
    const DOWNLOAD_FOLDER_PATH_ZIP = path.resolve(
      `public/downloads/${username}.zip`
    );

    fs.mkdirSync(DOWNLOAD_FOLDER_PATH);

    for (const i in videos) {
      const video = await fetch(videos[i]);
      const arrBuffer = await video.arrayBuffer();
      const buffer = Buffer.from(arrBuffer);

      const stream = fs.createWriteStream(
        path.join(DOWNLOAD_FOLDER_PATH, `/video-${i}.mp4`)
      );
      stream.write(buffer);
      stream.end();

      const output = fs.createWriteStream(DOWNLOAD_FOLDER_PATH_ZIP);
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });
      archive.pipe(output);

      archive.directory(DOWNLOAD_FOLDER_PATH, false);

      await archive.finalize();
      output.end();
    }

    fs.rmdirSync(DOWNLOAD_FOLDER_PATH, { recursive: true });
    return Response.json(`/downloads/${username}.zip`, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
};
