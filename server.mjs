import express from "express"
import fs from "fs"
import pathPackage from 'path'
const app = express()
//From FontAwesome icons
const movieIcon = `<div class='movie-icon'><svg  aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" class="svg-inline--fa fa-video fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
<path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z"></path>
</svg></div>`

const leftIcon  = `<span class="left-arrow">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" class="svg-inline--fa fa-arrow-left fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z">
    </path>
</svg></span>`
app.use(express.static('public'))


app.get("/health-check", (req, res) => {

    res.send("Yes it is runningg... :)")
})

app.get("/video", (req, res) => {
    console.log(req.query)
    const path = req.query.path
    const stat = fs.statSync(path)
    const fileSize = stat.size

    console.log("hello", fileSize);
    const range = req.headers.range
    console.log(range);
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1

        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        console.log("Calling video api");
        const vFs = fs.createReadStream("got.mkv")
        vFs.pipe(res)
    }
})

app.get("/videoplayer", (req, res) => {
    const path = req.query.path
    const videoHtml = `<div class="video_player"> 
    <video width="70%" height="60%" controls>
        <source src="http://localhost:5000/video?path=${path}" type="video/mp4">
    </video>
    <div><a href="/"> ${leftIcon}Back to Home</a></div>
</div>`

    res.send(html(videoHtml))
})

app.get("/", (req, res) => {
    const path = "/home/karthick/Documents/Videos/"

    var walkSync = function (dir, filelist) {
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            if (fs.statSync(dir + file).isDirectory()) {
                console.log(dir + file + '/');
                filelist = walkSync(dir + file + '/', filelist);
            } else {
                let oFile = `${dir}${file}`
                if (['.mp4', '.mkv'].includes(pathPackage.extname(oFile)))
                    filelist.push(`${oFile}`);
            }
        })
        return filelist;
    };
    let filelist = []
    walkSync(path, filelist)
    var items = filelist.map(file => {
        let title = file.split('/')
        return `<div class='video col-lg-2'>
            <a href=/videoplayer?path=${encodeURI(file)}>${movieIcon}</a>
            <p class='video-title'>${title[title.length-1]}</p>
        </div>`
    
    }).toString().replace(/,/g, '')

    var list = `<div class='video_list'>${items}</div>`
    res.send(html(list))
})

app.listen(5000, () => { console.log("Listening") })

const html = (html) => `<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Page Title</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o" crossorigin="anonymous"></script>

</head>

<body>
    ${html}
</body>

</html>`