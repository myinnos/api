var fs = require('fs');
const fetch = require('node-fetch');
CHAT_ID = "-1001363035222"; // Core
BOT_TOKEN = process.env.STUCK_BOT;
GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_WORKFLOW_URL = "https://github.com/" + process.env.GITHUB_REPOSITORY + "/actions/runs/" + process.env.GITHUB_RUN_ID;
e = process.argv[2]
if (e == "success") {
    if (fs.existsSync("/tmp/apidata_iumessage")) {
        var apidata_iumessage = fs.readFileSync('/tmp/apidata_iumessage', 'utf8');
        var apidata_iutable = fs.readFileSync('/tmp/apidata_iutable', 'utf8');


        url = encodeURI("https://api.telegram.org/bot" + BOT_TOKEN + "/editMessageText?message_id=929&chat_id=@covid19indiaorg_updates&parse_mode=Markdown&text="
            + apidata_iutable);
        let settings = { method: "Get" };
        fetch(url, settings).then(res => res.json())
            .then(json => console.log(json));
        url = encodeURI("https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=-1001478052719&parse_mode=Markdown&text="
            + apidata_iutable);
        fetch(url, settings).then(res => res.json())
            .then(json => console.log(json));

        url = encodeURI("https://api.telegram.org/bot" + BOT_TOKEN + "/sendmessage?" +
            "disable_web_page_preview=true&parse_mode=Markdown&chat_id=-1001449683810&text=" + apidata_iumessage);
        fetch(url, settings).then(res => res.json()).then(json => console.log(json));
    }
    return;
}

var err = fs.readFileSync('/tmp/apidata_err', 'utf8');
console.log("Sending the following to core");
console.log(err);
err = err.replace(new RegExp(BOT_TOKEN, 'g'), "****");
err = err.replace(new RegExp(GITHUB_TOKEN, 'g'), "****");
console.log(err);

// BOT_TOKEN = process.argv[2];
var temp_url = "https://api.telegram.org/bot" + BOT_TOKEN +
    "/sendmessage?disable_web_page_preview=true&chat_id=" + CHAT_ID + "&text=GitHub Action Status: " + e + "\n" + GITHUB_WORKFLOW_URL + "\n\n" + err;
url = encodeURI(temp_url);
let settings = { method: "Get" };
fetch(url, settings).then(res => res.json())
    .then(json => {console.log(json) });
