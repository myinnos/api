const fs = require('fs');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const data = require('../tmp/data.json');
const data_prev = require('../tmp/data_prev.json');

update_log_file = './tmp/updatelog/log.json';
var update_log = require("." + update_log_file);

statewise_new = data.statewise.reduce((arr, row) => {
    arr[row.state] = row;
    return arr;
}, {});

var conf_text;
var recov_text;
var death_text;
var full_text = "";
var tg_full_text = "";
var isChanged = false;

var rel_states = {};

function init_rel_states(state) {
    if (!rel_states[state]) {
        rel_states[state] = {};
    }
}

data_prev.statewise.forEach(element => {
    if (element.state == "Total") {
        return;
    }
    isChanged = false;
    conf_text = null;
    recov_text = null;
    death_text = null;
    text = null;
    if (parseInt(element.confirmed) < parseInt(statewise_new[element.state].confirmed)) {
        confirmed_diff = statewise_new[element.state].confirmed - element.confirmed;
        conf_text = confirmed_diff + " new case" + (confirmed_diff == 1 ? "" : "s");
        isChanged = true;
    }
    if (parseInt(element.recovered) < parseInt(statewise_new[element.state].recovered)) {
        recovered_diff = statewise_new[element.state].recovered - element.recovered;
        recov_text = recovered_diff + " recover" + (recovered_diff == 1 ? "y" : "ies");
        isChanged = true;
    }
    if (parseInt(element.deaths) < parseInt(statewise_new[element.state].deaths)) {
        death_diff = statewise_new[element.state].deaths - element.deaths;
        death_text = death_diff + " death" + (death_diff == 1 ? "" : "s");
        isChanged = true;
    }

    if (isChanged) {
        text = (conf_text ? conf_text + ", " : "") + (recov_text ? recov_text + ", " : "") + (death_text ? death_text + ", " : "");
        arr = text.split(", ");
        if (arr.length > 2) {
            arr = text.split(", ");
            arr = arr.slice(0, -1);
            arr_last = arr[arr.length - 1];
            arr = arr.slice(0, -1);
            text = arr.join(", ");
            text = text + " and " + arr_last
        } else {
            arr = arr.slice(0, -1);
            text = arr.join();
        }
        text = text + " in " + element.state
        full_text = full_text + text + "\n"
    }
});
function fillSpace(str, width) {
    empt = Array(width - str.length).join(' ')
    return empt + str;
}


const width_state = 2;
const width_confirmed = 13;
const width_recovered = 12;
const width_deceased = 12;

function editMessage(last_updated) {

    data.statewise.forEach(element => {
        state_code = element.statecode;
        if (state_code == "TT" || statewise_new[element.state].confirmed == 0) {
            return;
        }
        init_rel_states(state_code);
        rel_states[state_code]["C"] = +statewise_new[element.state].confirmed;
        rel_states[state_code]["Cd"] = +statewise_new[element.state].deltaconfirmed;
        rel_states[state_code]["R"] = +statewise_new[element.state].recovered;
        rel_states[state_code]["Rd"] = +statewise_new[element.state].deltarecovered;
        rel_states[state_code]["D"] = +statewise_new[element.state].deaths;
        rel_states[state_code]["Dd"] = +statewise_new[element.state].deltadeaths;
    });
    words = fillSpace("St", width_state) +
        fillSpace("Cnfrmd", width_confirmed) +
        fillSpace("Rcvrd", width_recovered) +
        fillSpace("Dcsd", width_deceased) + "\n";

    const length_of_line = width_state + width_confirmed + width_recovered + width_deceased;
    words += Array(length_of_line).join("-") + "\n";
    count = 1
    for (element in rel_states) {
        c = "(" + rel_states[element].Cd + ") " + rel_states[element].C;
        r = "(" + rel_states[element].Rd + ") " + rel_states[element].R;
        d = "(" + rel_states[element].Dd + ") " + rel_states[element].D;

        words += fillSpace(element, width_state) +
            fillSpace(c, width_confirmed) +
            fillSpace(r, width_recovered) +
            fillSpace(d, width_deceased) + "\n";
        count++;
        // console.log(rel_states[element]);
    }
    india_total = "*Covid-19 India*\n";
    india_total += "Last updated: _" + last_updated + "_\n\n";

    total = statewise_new["Total"];
    india_total += "```    Total cases: (↑" + total.deltaconfirmed + ") " + total.confirmed
        + "\n" + "    Recovered  : (↑" + total.deltarecovered + ") " + total.recovered
        + "\n" + "    Deaths     : (↑" + total.deltadeaths + ") " + total.deaths + "```";

    // console.log(india_total);

    words = india_total + "\n\n```\n" + words + "```\n\n*www.covid19india.org*";

    console.log(words);
    fs.writeFileSync('/tmp/apidata_iutable', words);
    return;
}


if (full_text != "") {

    total = statewise_new["Total"];
    tg_full_text = full_text + "\n"
        + "``` Total cases: (↑" + total.deltaconfirmed + ") " + total.confirmed
        + "\n" + " Recovered  : (↑" + total.deltarecovered + ") " + total.recovered
        + "\n" + " Deaths     : (↑" + total.deltadeaths + ") " + total.deaths + "```";

    const now = moment().unix()
    entry = {};
    entry.update = full_text;
    entry.timestamp = now;
    update_log.push(entry);
    update_log = update_log.slice(-50)

    fs.writeFileSync(update_log_file, JSON.stringify(update_log, null, 2));

    var date = moment.unix(now);
    formated_time = date.tz("Asia/Kolkata").format("MMMM DD, hh:mm A") + " IST";
    editMessage(formated_time);

    // console.log(formated_time)
    var final_text = "_"
        + formated_time + "_\n\n"
        + tg_full_text
        + "\n\n*www.covid19india.org*";
    console.log(final_text);

    fs.writeFileSync('/tmp/apidata_iumessage', final_text);
} else {
    console.log("No updates this time!");
}
