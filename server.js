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
app.use(express.static(path.join(__dirname, "public")));

// API 라우트 처리
app.use("/api", (req, res, next) => {
  console.log("API route detected:", req.path);
  next();
});

// 로또 번호 API
app.get("/api/lotto/:round", async (req, res) => {
  const round = req.params.round;

  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
    );
    if (!response.data) {
      throw new Error("No data received from Lotto API");
    }
    res.status(200).json(response.data); // 반드시 응답
  } catch (error) {
    console.error("Error fetching lotto data:", error.message);
    res.status(500).send("Error fetching lotto data");
  }
});

// 라우팅
app.get("*", (req, res) => {
  res.render("index", { title: "Check Lotto" });
});

// local 서버 실행
const PORT = process.env.PORT || 5020;
const listener = app.listen(PORT, () => {
  console.log("Server is running on port " + listener.address().port);
});

// vercel 앱 내보내기 (필수)
module.exports = app;
