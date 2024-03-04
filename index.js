const express = require('express');
const axios   = require('axios');
const path    = require('path');

const app  = express();
const port = process.env.PORT || 5002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/find-apple-id', async (req, res) => {
  try {
    const appleIdRaw = req.body.appleId;
    const appleID    = appleIdRaw.replace(/\D+/g, '');

    const iTunesUrl     = `https://itunes.apple.com/lookup?id=${appleID}`;
    const appExtraction = await axios.get(iTunesUrl);

    if (appExtraction.data.results.length > 0) {
      const trackName = appExtraction.data.results[0].trackCensoredName;
      const bundleId  = appExtraction.data.results[0].bundleId;
      const iconUrl   = appExtraction.data.results[0].artworkUrl60;
      const version   = appExtraction.data.results[0].version;
      const versionDate = appExtraction.data.results[0].currentVersionReleaseDate;
      const minOsVer  = appExtraction.data.results[0].minimumOsVersion;

      // Send the response with bundle ID, icon URL, and reset and copy buttons
      res.status(200).send(`
      <html>

      <head>
        <title>Apple ID Finder</title>
        <link rel="icon" type="image/png" href="favicon.png">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

        <style>
          body {
            font-family: 'Poppins', sans-serif;
            font-size: 16px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
          }
          h2 {
            font-size: 1.5rem;
          }
          img {
            width: 64px;
            height: 64px;
            object-fit: contain;
            margin-right: 10px;
          }
          .bundle {
            display: flex;
            align-items: center;
            margin: 20px 0;
            padding: 10px;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .bundle img {
            margin-right: 20px;
          }
          .bundle span {
            font-size: 1.1rem;
          }
          button {
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 12px 24px;
            font-size: 1rem;
            cursor: pointer;
          }
          @media (prefers-color-scheme: dark) {
          /* Dark mode styles */
          body {
            background-color: #1a1a1a;
            color: #ffffff;
          }
        </style>
      </head>
      <body>
        <h2>The link given is referred to App: "${trackName}"</h2>
        <div class="bundle">
          <img src="${iconUrl}" alt="App Icon">
          <span>${bundleId}</span>
          <span style="cursor: pointer;" onclick="copyBundleId('${bundleId}')">🔗</span>
        </div>
        <p> The latest version by Apple is: <u> ${version} </u></p>
        <p> Version Released Date: <u> ${versionDate} (UTC) </u></p>
        <p> Minimum Requirement for iOS: <u> ${minOsVer} </u></p>

        <button onclick="goToHomePage()">Go to Home Page</button>

        <script>
        function goToHomePage() {
          window.location.href = "/";
          // Additional code to reset form values if needed
        }

        function copyBundleId(bundleId) {
          const el = document.createElement('textarea');
          el.value = bundleId;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        }
        </script>

      </body>

      </html>
      `);
    } else {
      res.status(404).send(`
      <html>

      <head>
      <title>Apple ID Finder</title>
      <link rel="icon" type="image/png" href="favicon.png">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

      </head>
      <style>
      @media (prefers-color-scheme: dark) {
        /* Dark mode styles */
        body {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        h2 {
          font-family: 'Poppins', sans-serif;
          font-size: 1 rem;
        }
        button {
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 12px 24px;
          font-size: 1rem;
          cursor: pointer;
        }
      </style>

      <body>
        <h2>Your ID was not found. Please check again</h2>

        <button onclick="goToHomePage()">Go to Home Page</button>

        <script>
          function goToHomePage() {
            window.location.href = "/";
          }
        </script>

      </body>

      </html>
      `);
    }
  } catch (error) {
    res.status(500).send(`
    <html>

    <head>
    <title>Apple ID Finder</title>
    <link rel="icon" type="image/png" href="favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

    </head>
    <style>
    @media (prefers-color-scheme: dark) {
      /* Dark mode styles */
      body {
        background-color: #1a1a1a;
        color: #ffffff;
      }
      h2 {
        font-family: 'Poppins', sans-serif;
        font-size: 1 rem;
      }
      button {
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 12px 24px;
        font-size: 1rem;
        cursor: pointer;
      }
    </style>

    <body>
    <h2>An error occurred while fetching the Apple ID. Please check again</h2>


      <button onclick="goToHomePage()">Go to Home Page</button>

      <script>
        function goToHomePage() {
          window.location.href = "/";
        }
      </script>

    </body>

    </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}/`);
});
