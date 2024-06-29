const http = require("http");
const requests = require("requests");
const fs = require("fs");
const path = require("path");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2));
  temperature = temperature.replace("{%tempmin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
  temperature = temperature.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempStatus%}", orgVal.weather[0].main);
  return temperature;
};

const server = http.createServer((req, res) => {
  const filePath = req.url === "/" ? "home.html" : req.url.slice(1); // Assuming static files are in the root directory

  if (filePath === "style.css") {
    const cssPath = path.join(__dirname, filePath);
    const cssFile = fs.readFileSync(cssPath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(cssFile);
    res.end();
    return;
  }

  if (filePath === "home.html") {
    requests("https://api.openweathermap.org/data/2.5/weather?lat=28.704060&lon=77.102493&appid=98e186753f02693ffd8011615a663692")
      .on("data", (chunk) => {
        const objData = JSON.parse(chunk);
        const arrData = [objData];
        const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join("");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(realTimeData);
        res.end();
      })
      .on("end", (err) => {
        if (err) {
          console.log("Connection closed due to errors", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error fetching data");
        }
      })
      .on("error", (err) => {
        console.log("Error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error fetching data");
      });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Server is running at http://127.0.0.1:3000");
});
