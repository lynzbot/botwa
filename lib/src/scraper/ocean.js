const axios = require('axios');
module.exports = async (url, format, quality) => {
   try {
      const userAgentList = [
         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
         'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36'
      ];
      const apiUrl = `https://p.oceansaver.in/ajax/download.php?copyright=0&format=${format == 'mp4' ? quality : 'mp3'}&url=${url}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
      const downloadRequest = await axios.get(apiUrl, {
         headers: {
            'User-Agent': userAgentList[Math.floor(Math.random() * userAgentList.length)],
            'referer': 'https://y2mate.lol/en161/'
         }
      });
      if (!downloadRequest.data.success) throw new Error('Failed to initiate download.');
      const videoId = downloadRequest.data.id;
      const videoTitle = downloadRequest.data.info.title;
      const thumbnailUrl = downloadRequest.data.info.image;
      let downloadUrl = '';
      while (true) {
         const progressUrl = `https://p.oceansaver.in/ajax/progress.php?id=${videoId}`;
         const progressRequest = await axios.get(progressUrl);
         if (progressRequest.data.success && progressRequest.data.progress >= 1000) {
            downloadUrl = progressRequest.data.download_url;
            break;
         }
         await new Promise(resolve => setTimeout(resolve, 3000));
      }
      if (!downloadUrl) throw new Error('Failed to fetch download URL.');
      return {
         title: videoTitle,
         thumbnail: thumbnailUrl,
         link: downloadUrl
      };
   } catch (error) {
      throw error;
   }
}
