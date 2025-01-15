const express = require("express");
const path = require("path");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const chokidar = require("chokidar");

// for lotto api
const axios = require("axios");

const app = express();

// LiveReload 설정
const liveReloadServer = livereload.createServer();
liveReloadServer.watch([
  path.join(__dirname, "public"), // 정적 파일 감시
]);

// chokidar로 views 디렉토리 감시
chokidar.watch(path.join(__dirname, "views/**/*.*")).on("change", () => {
  liveReloadServer.refresh("/");
});

// LiveReload 미들웨어
app.use(connectLivereload());

// EJS 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 라우팅
app.get("/", (req, res) => {
  res.render("index");
});

// 서버 실행
const PORT = process.env.PORT || 5020;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// for lotto api
app.get("/api/lotto/:round", async (req, res) => {
  const round = req.params.round;
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error fetching lotto data");
  }
});
