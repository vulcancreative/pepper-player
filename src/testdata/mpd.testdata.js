const tfVodMpd = {
  url: "http://media.tfod.tomferry.com/" +
       "EF6K95BydowVv4Od6kvpkLvi3QzbeLDKiqfZcqRPWzZgE9rZhK/" +
       "uZUxdD2UDUcaO6FEKURQ/gLtSO2kPCWKZKXSdAeOj/" +
       "SYC0zeIlORZH1JLBUe4z",
  data: `<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="urn:mpeg:dash:schema:mpd:2011"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xsi:schemaLocation="urn:mpeg:DASH:schema:MPD:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd"
  profiles="urn:mpeg:dash:profile:isoff-live:2011"
  type="static"
  mediaPresentationDuration="PT2M3.5S"
  minBufferTime="PT1.0S">
  <ProgramInformation>
  </ProgramInformation>
  <Period start="PT0.0S">
    <AdaptationSet contentType="video" segmentAlignment="true" bitstreamSwitching="true" frameRate="30000/1001">
      <Representation id="0" mimeType="video/mp4" codecs="avc1.64001e" bandwidth="3000000" width="640" height="360" frameRate="30000/1001">
        <SegmentTemplate timescale="1000000" duration="1001000" initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1">
        </SegmentTemplate>
      </Representation>
      <Representation id="1" mimeType="video/mp4" codecs="avc1.64001f" width="1280" height="720" frameRate="30000/1001">
        <SegmentTemplate timescale="1000000" duration="1001000" initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1">
        </SegmentTemplate>
      </Representation>
      <Representation id="2" mimeType="video/mp4" codecs="avc1.640028" width="1920" height="1080" frameRate="30000/1001">
        <SegmentTemplate timescale="1000000" duration="1001000" initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1">
        </SegmentTemplate>
      </Representation>
    </AdaptationSet>
    <AdaptationSet contentType="audio" segmentAlignment="true" bitstreamSwitching="true">
      <Representation id="3" mimeType="audio/mp4" codecs="mp4a.40.2" bandwidth="128000" audioSamplingRate="48000">
        <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="2" />
        <SegmentTemplate timescale="1000000" duration="1001000" initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1">
        </SegmentTemplate>
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>`
};

const bbb4kVodMpd = {
  url: "https://dash.akamaized.net/akamai/" +
       "bbb_30fps/bbb_30fps.mpd",
  data: `<MPD mediaPresentationDuration="PT634.566S" minBufferTime="PT2.00S" profiles="urn:hbbtv:dash:profile:isoff-live:2012,urn:mpeg:dash:profile:isoff-live:2011" type="static" xmlns="urn:mpeg:dash:schema:mpd:2011" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:mpeg:DASH:schema:MPD:2011 DASH-MPD.xsd">
 <BaseURL>./</BaseURL>
 <Period>
  <AdaptationSet mimeType="video/mp4" contentType="video" subsegmentAlignment="true" subsegmentStartsWithSAP="1" par="16:9">
   <SegmentTemplate duration="120" timescale="30" media="$RepresentationID$/$RepresentationID$_$Number$.m4v" startNumber="1" initialization="$RepresentationID$/$RepresentationID$_0.m4v"/>
   <Representation id="bbb_30fps_1024x576_2500k" codecs="avc1.64001f" bandwidth="3134488" width="1024" height="576" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_1280x720_4000k" codecs="avc1.64001f" bandwidth="4952892" width="1280" height="720" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_1920x1080_8000k" codecs="avc1.640028" bandwidth="9914554" width="1920" height="1080" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_320x180_200k" codecs="avc1.64000d" bandwidth="254320" width="320" height="180" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_320x180_400k" codecs="avc1.64000d" bandwidth="507246" width="320" height="180" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_480x270_600k" codecs="avc1.640015" bandwidth="759798" width="480" height="270" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_640x360_1000k" codecs="avc1.64001e" bandwidth="1254758" width="640" height="360" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_640x360_800k" codecs="avc1.64001e" bandwidth="1013310" width="640" height="360" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_768x432_1500k" codecs="avc1.64001e" bandwidth="1883700" width="768" height="432" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_3840x2160_12000k" codecs="avc1.640033" bandwidth="14931538" width="3840" height="2160" frameRate="30" sar="1:1" scanType="progressive"/>
  </AdaptationSet>
  <AdaptationSet mimeType="audio/mp4" contentType="audio" subsegmentAlignment="true" subsegmentStartsWithSAP="1">
   <Accessibility schemeIdUri="urn:tva:metadata:cs:AudioPurposeCS:2007" value="6"/>
   <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main"/>
   <SegmentTemplate duration="192512" timescale="48000" media="$RepresentationID$/$RepresentationID$_$Number$.m4a" startNumber="1" initialization="$RepresentationID$/$RepresentationID$_0.m4a"/>
   <Representation id="bbb_a64k" codecs="mp4a.40.5" bandwidth="67071" audioSamplingRate="48000">
    <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="2"/>
   </Representation>
  </AdaptationSet>
 </Period>
</MPD>`
};

const bbb4kThumbnailsVodMpd = {
  url: "http://dash.edgesuite.net/akamai/" +
       "bbb_30fps/bbb_with_tiled_thumbnails.mpd",
  data : `<MPD mediaPresentationDuration="PT634.566S" minBufferTime="PT2.00S" profiles="urn:hbbtv:dash:profile:isoff-live:2012,urn:mpeg:dash:profile:isoff-live:2011" type="static" xmlns="urn:mpeg:dash:schema:mpd:2011" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:mpeg:DASH:schema:MPD:2011 DASH-MPD.xsd">
 <BaseURL>./</BaseURL>
 <Period>
  <AdaptationSet id="1" mimeType="video/mp4" contentType="video" subsegmentAlignment="true" subsegmentStartsWithSAP="1" par="16:9">
   <SegmentTemplate duration="120" timescale="30" media="$RepresentationID$/$RepresentationID$_$Number$.m4v" startNumber="1" initialization="$RepresentationID$/$RepresentationID$_0.m4v"/>
   <Representation id="bbb_30fps_1024x576_2500k" codecs="avc1.64001f" bandwidth="3134488" width="1024" height="576" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_1280x720_4000k" codecs="avc1.64001f" bandwidth="4952892" width="1280" height="720" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_1920x1080_8000k" codecs="avc1.640028" bandwidth="9914554" width="1920" height="1080" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_320x180_200k" codecs="avc1.64000d" bandwidth="254320" width="320" height="180" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_320x180_400k" codecs="avc1.64000d" bandwidth="507246" width="320" height="180" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_480x270_600k" codecs="avc1.640015" bandwidth="759798" width="480" height="270" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_640x360_1000k" codecs="avc1.64001e" bandwidth="1254758" width="640" height="360" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_640x360_800k" codecs="avc1.64001e" bandwidth="1013310" width="640" height="360" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_768x432_1500k" codecs="avc1.64001e" bandwidth="1883700" width="768" height="432" frameRate="30" sar="1:1" scanType="progressive"/>
   <Representation id="bbb_30fps_3840x2160_12000k" codecs="avc1.640033" bandwidth="14931538" width="3840" height="2160" frameRate="30" sar="1:1" scanType="progressive"/>
  </AdaptationSet>
  <AdaptationSet id="2" mimeType="audio/mp4" contentType="audio" subsegmentAlignment="true" subsegmentStartsWithSAP="1">
   <Accessibility schemeIdUri="urn:tva:metadata:cs:AudioPurposeCS:2007" value="6"/>
   <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main"/>
   <SegmentTemplate duration="192512" timescale="48000" media="$RepresentationID$/$RepresentationID$_$Number$.m4a" startNumber="1" initialization="$RepresentationID$/$RepresentationID$_0.m4a"/>
   <Representation id="bbb_a64k" codecs="mp4a.40.5" bandwidth="67071" audioSamplingRate="48000">
    <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="2"/>
   </Representation>
  </AdaptationSet>

  <AdaptationSet id="3" mimeType="image/jpeg" contentType="image">
    <SegmentTemplate media="$RepresentationID$/tile_$Number$.jpg" duration="100" startNumber="1"/>
    <Representation bandwidth="12288" id="thumbnails_320x180" width="3200" height="180">
      <EssentialProperty schemeIdUri="http://dashif.org/thumbnail_tile" value="10x1"/>
    </Representation>
  </AdaptationSet>


 </Period>
</MPD>`
};

const echoLiveMpd = {
  url: "http://vm2.dashif.org/livesim/" +
       "segtimeline_1/testpic_2s/Manifest.mpd",
  data: `<?xml version="1.0" encoding="utf-8"?>
<MPD availabilityStartTime="1970-01-01T00:00:00Z" id="Config part of url maybe?" minBufferTime="PT2S" minimumUpdatePeriod="PT0S" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple" publishTime="2018-06-13T17:08:08Z" timeShiftBufferDepth="PT5M" type="dynamic" ns1:schemaLocation="urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd" xmlns="urn:mpeg:dash:schema:mpd:2011" xmlns:ns1="http://www.w3.org/2001/XMLSchema-instance">
   <ProgramInformation>
      <Title>Media Presentation Description from DASHI-IF live simulator</Title>
   </ProgramInformation>
   <BaseURL>http://vm2.dashif.org/livesim/segtimeline_1/testpic_2s/</BaseURL>
<Period id="p0" start="PT0S">
      <AdaptationSet contentType="audio" lang="eng" mimeType="audio/mp4" segmentAlignment="true" startWithSAP="1">
         <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
         <SegmentTemplate initialization="$RepresentationID$/init.mp4" media="$RepresentationID$/t$Time$.m4s" timescale="48000">
<SegmentTimeline>
<S d="96256" r="1" t="73387650528256" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
<S d="96256" r="2" />
<S d="95232" />
</SegmentTimeline>
</SegmentTemplate>
         <Representation audioSamplingRate="48000" bandwidth="48000" codecs="mp4a.40.2" id="A48">
            <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="2" />
         </Representation>
      </AdaptationSet>
      <AdaptationSet contentType="video" maxFrameRate="60/2" maxHeight="360" maxWidth="640" mimeType="video/mp4" minHeight="360" minWidth="640" par="16:9" segmentAlignment="true" startWithSAP="1">
         <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
         <SegmentTemplate initialization="$RepresentationID$/init.mp4" media="$RepresentationID$/t$Time$.m4s" timescale="90000">
<SegmentTimeline>
<S d="180000" r="150" t="137601844740000" />
</SegmentTimeline>
</SegmentTemplate>
         <Representation bandwidth="300000" codecs="avc1.64001e" frameRate="60/2" height="360" id="V300" sar="1:1" width="640" />
      </AdaptationSet>
   </Period>
</MPD>`
};

export {
  tfVodMpd,
  bbb4kVodMpd,
  bbb4kThumbnailsVodMpd,
  echoLiveMpd,
};