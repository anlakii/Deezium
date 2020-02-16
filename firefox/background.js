function logListen(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = event => {
    let str = decoder.decode(event.data, { stream: false });
    let json = JSON.parse(str);

    json.results = false;
    str = JSON.stringify(json);
    filter.write(encoder.encode(str));
    filter.disconnect();
  };
  return {};
}

function userData(details) {
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = event => {
    let str = decoder.decode(event.data, { stream: false });
    let json = JSON.parse(str);
    let key = [102, 228, 95, 242, 215, 50, 122, 26, 57, 216, 206, 38, 164, 237, 200, 85];

    let aesEcb = new aesjs.ModeOfOperation.ecb(key);

    let encryptedBytes = aesjs.utils.hex.toBytes(json.results.PLAYER_TOKEN);
    let decryptedBytes = aesEcb.decrypt(encryptedBytes);
    let decryptedToken = aesjs.utils.utf8.fromBytes(decryptedBytes);
    let decryptedTokenJson = JSON.parse(decryptedToken.replace(/\0/g, ''))

    decryptedTokenJson.hq = true;
    decryptedTokenJson.lossless = true;
    decryptedTokenJson.sound_quality.high = true;
    decryptedTokenJson.sound_quality.lossless = true;

    for (const opt in decryptedTokenJson.audio_qualities){
        decryptedTokenJson.audio_qualities[opt].push('high')
        decryptedTokenJson.audio_qualities[opt].push('lossless')
    }

    newToken = JSON.stringify(decryptedTokenJson);
    let tokenLength = newToken.length;
    console.log(newToken.length)

    for(let i = 0; i < 16 - (tokenLength % 16); i++){
        newToken += '\0';
    }

    let tokenBytes = aesjs.utils.utf8.toBytes(newToken);
    encryptedBytes = aesEcb.encrypt(tokenBytes);
    let newTokenHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    json.results.PLAYER_TOKEN = newTokenHex;
    json.results.USER.SETTING.site.player_hq = true;
    json.results.USER.SETTING.site.player_audio_quality = "high";
    json.results.USER.SETTING.site.cast_audio_quality = "high";
    json.results.USER.SETTING.audio_quality_settings.preset = "fast";

    json.results.OFFER_ID = 600;
    json.results.ad_triton = false;
    json.results.public_api_test = true;
    json.results.USER.OPTIONS.ads_audio = false;
    json.results.USER.OPTIONS.ads_display = false;
    json.results.USER.OPTIONS.allow_subscription = false;
    json.results.USER.OPTIONS.allow_trial_mobile = true;
    json.results.USER.OPTIONS.mobile_hq = true;
    json.results.USER.OPTIONS.mobile_lossless = true;
    json.results.USER.OPTIONS.web_hq = true;
    json.results.USER.OPTIONS.web_lossless = true;
    json.results.USER.OPTIONS.web_offline = true;
    json.results.USER.OPTIONS.streaming_group = "sub";
    json.results.USER.OPTIONS.can_subscribe = false;
    json.results.USER.OPTIONS.show_subscription_section = false;
    delete json.results.USER.OPTIONS.upgrade;
    delete json.results.USER.ENTRYPOINTS.AUDIO_SETTING_HIFI;
    delete json.results.USER.ENTRYPOINTS.AUDIO_SETTING_PREMIUM;
    delete json.results.USER.ENTRYPOINTS.CONVERSION_BANNER_FREE;
    delete json.results.USER.ENTRYPOINTS.LYRICS_PANEL;
    delete json.results.USER.ABTEST;
    str = JSON.stringify(json);

    filter.write(encoder.encode(str));
    filter.disconnect();
  };

  return {};
}

console.log("Loaded!");
browser.webRequest.onBeforeRequest.addListener(
  userData,
  {
    urls: [
      "https://www.deezer.com/ajax/gw-light.php?method=deezer.getUserData*"
    ],
    types: ["xmlhttprequest", "other", "script", "object_subrequest"]
  },
  ["blocking"]
);
browser.webRequest.onBeforeRequest.addListener(
  logListen,
  {
    urls: ["https://www.deezer.com/ajax/gw-light.php?method=log.listen*"],
    types: ["xmlhttprequest", "other", "script", "object_subrequest"]
  },
  ["blocking"]
);
