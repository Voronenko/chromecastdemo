chromecastdemo
==============

## Background

I think due to price strategy, Chromecast devices will be present almost in any TV. This is good reason to provide
additional benefits from using your website for visitors with Chromecast deviceû. In this article I will assist you
with first steps on integrating cast api into your site code. Please feel free to provide your comments to this
article with your tips and tricks from your own experience.

## Prerequisites

In order, to start coding, you need:

*   Chromecast device itself
*   TV or Display with HDMI input
*   Google Chrome for best debugging experience
*   Installed Google Cast extension for  Chrome
*   know your device serial number(present on a box above bar code and on device itself
*   know urls for staging and live versions of the website

## Configure your Chromecast for development

### Device whitelisting

In order to develop for Chromecast - you need to whitelist your device.
Please navigate to [https://developers.google.com/cast/whitelisting](https://developers.google.com/cast/whitelisting),
choose "Request Whitelisting" link.  Provide Google with your email address, device serial number and two(2) urls
pointing to the location of your receiver app html page,typically one for Q&amp;A and one for production, on your server.
You should expect to receive the answer in 24-48hours. If it is not in case, repeat your request in 5 days.

### Configure Chrome Cast extension settings

<table>
    <tr>
        <td>
            <figure>
              ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/googlecaststore.jpg)
              <figcaption>Install Cast extension from google chrome store</figcaption>
            </figure>
        </td>
        <td>
            <figure>
                ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/extensionoptions.jpg)
              <figcaption>Choose opitons</figcaption>
            </figure>

        </td>
    </tr>
    <tr>
        <td>
            <figure>
                ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/blueicon.jpg)
                <figcaption>Click four(4) times on a top blue icon</figcaption>
            </figure>
        </td>
        <td>
            <figure>
                ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/developersettings.jpg)
                <figcaption>Under Developer Settings, register your live and staging website domains. Good idea to list there http://localhost/ as well.</figcaption>
            </figure>
        </td>
    </tr>
</table>

### Wait for device whitelisting confirmation

In a day or two you will receive email like:

<pre>
Thank you for your interest in developing for Chromecast.

Please use the following Developer ID when communicating with Google in the future:
6F9619FF-8B86-D011-B42D-00CF4FC964FF

Your AppID(s) are:
6F9619FF-8B86-D011-B42D-00CF4FC964FF -> http://www.yoursite.com/chromecast/rcvr/receiver.html
</pre>

The GUID is the unique ID of your application that you will be using both on receiving and sending parts.

## Integration endpoints

Chromecast integration consists of two parts:

### Sender

HTML page opened in client browser, that has information about content to be casted.
In order to notify, that page supports casting, include data attribute **cast-api-enabled** into opening html tag.
<pre>
    &lt;html data-cast-api-enabled="true"&gt;
</pre>
Google defines [Cast Chrome Sender API](https://developers.google.com/cast/reference/chrome/jsdoc/):
the set of data objects and functions available to web pages that have been whitelisted for the Chrome Sender API.

### Receiver

HTML5 single page application which is loaded by Chromecast device once casting is initiated. Include API file script
reference into your receiver page: [http://www.gstatic.com/cast/js/receiver/1.0/cast_receiver.js](http://www.gstatic.com/cast/js/receiver/1.0/cast_receiver.js
). Note: API version is subject to change.

Description of the API available for receiver page can be found
on [this link](https://developers.google.com/cast/reference/receiver/jsdoc/)

## Debugging receiver application

You might ask: how can I find out why my receiver application is not working on Chromecast device?
Fortunately, device enabled for development opens port 9222 for remote debugging:

![](https://raw.github.com/Voronenko/chromecastdemo/master/images/remotedebuglink.jpg)

![](https://raw.github.com/Voronenko/chromecastdemo/master/images/remotedebugbody.jpg)

You can set breakpoints in a your receiver page code, output trace information into console using console.log.
Additionally, You can control level of the cast api tracing information by calling **cast.receiver.logger.setLevelValue**
 function.
<pre>
cast.receiver.logger.setLevelValue(0);
</pre>

## Simple Demo application

Let me demonstrate, how website can cast some video file using chromecast.
Let's consider most easy case: ability to play video file.

<figure>
  ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/sampleapplication.jpg)
  <figcaption>By clicking on video file, playback is started on a selected device.</figcaption>
</figure>

<figure>
  ![](https://raw.github.com/Voronenko/chromecastdemo/master/images/deviceselection.jpg)
  <figcaption>If there are more than one device - I provide possibility to select which one should be used.</figcaption>
</figure>

By clicking on media url, playback is started on selected chromecast device.

### Receiver single page application

As a minimum,  you should expect following media formats
to be supported by Chromecast device with minimum coding efforts:

*   Video codecs: H.264 High Profile Level 4.1, 4.2 and 5, VP8
*   Audio decoding: HE-AAC, LC-AAC, CELT/Opus, MP3
*   Containers: MP4/CENC, WebM, MPEG-DASH, SmoothStreaming

In this case minimum initialization application code is below:
<pre>
    cast.receiver.logger.setLevelValue(0);
      var ns= cast.receiver.RemoteMedia.NAMESPACE;
      var receiver = new cast.receiver.Receiver(
          'd6d488e8-7b35-4834-a4c9-935d660ab65c', [ns],
          "",
          5);
      var remoteMedia = new cast.receiver.RemoteMedia();

      remoteMedia.addChannelFactory(
          receiver.createChannelFactory(ns));

      receiver.start();

      window.addEventListener('load', function() {
        var elem = document.getElementById('vid');
        remoteMedia.setMediaElement(elem);
      });
</pre>

and corresponding html view consists of Loading indicator and html5 video element only:
<pre>
    &lt;video id="vid"
              style="position:absolute;top:0;left:0;height:100%;width:100%"&gt;
    &lt;/video&gt;
    &lt;div id="status" style="display:none; font-size:300%; position:absolute;top:40%;left:40%;"&gt;
         LOADING....
    &lt;/div&gt;
</pre>

I have used [cast.receiver.RemoteMedia](https://developers.google.com/cast/reference/receiver/jsdoc/cast.receiver.RemoteMedia)
class - default implementation of RAMP protocol handler. Some time ago had description in a bit clear format,- on
[this Github link](https://github.com/dz0ny/leapcast/wiki/RAMP-protocol) you can find historic version of the
Google Cast messages explained.

What this application does - once it receives supported media link - it starts playing the video file on paired
html5 media element. By calling remoteMedia.setMediaElement method - we tell RemoteMedia instance to use our video
element for playback.

    Important note: it should be placed on exactly the same location that you've registered during device whitelisting.

### Sender application - Integrate into your existing site.

If html tag contains data attribute cast-api-enabled="true", the content script checks for this attribute and
injects and initializes the API. The API sets the variable cast.isAvailable to true and posts a MessageEvent to
the host page’s window object of the form:

<pre>
    {source: "CastApi", event: "Hello", api_version: [, ]}
</pre>

Here, api_version is the API version that is supported. The version is a 2-element array of integers,
starting with an initial version of [1, 0]. When Google commits backwards-incompatible changes to the API,
the major version number will be incremented. For backwards-compatible changes, Google will increment the minor
version number.

In my demo app I have to portions of code: consumer (i.e. website) and chromecast api helper module that hides specifics
of chromecast API and provides three methods: **ready**, **init**, **play**.
Consumer first subscribes for ready callback, by calling ready(callback function) method. Once helper module indicates,
that it's ready to communicate with Chromecast, consumer calls init method and passes information about itself:

<pre>
    var defaultCastAPIConsumer = {
         applicationID:'',  //applicationID assigned by google
         setReceivers: function(){}, //This method is called when I receive list of chromecast devices
         getCastingDevice: function(){} //I call this method to ask application what device is selected for playback.
     };
</pre>

After this, It can initiate playing media url on device by calling play(mediaurl).

### Cast API integration portions

In my example, I've used Promise pattern to define CastAPIReady promise, that I resolve once API is ready.

<pre>
    if (window.cast && window.cast.isAvailable) {
        CastAPIReady.resolve();
    } else {
      window.addEventListener("message", function(event) {
        if (event.source == window && event.data && event.data.source == "CastApi" && event.data.event == "Hello"){
            CastAPIReady.resolve(event);
        }
      });
    };

</pre>

Once API is ready, it is good idea to check whenever TV is on (i.e. are there any working Chromecast devices.
Typically, you have to add listener for chromecast devices. Documentation defines this method as
"Adds a listener function that with the current list of receivers that supports the given activity type. When added,
the listener will be called immediately with the current list, and whenever the list of receivers changes.".
I am passing received applicationID for my website as a first parameter. If callback contains one device - you can
use it for playback without prompt. If there are two or more devices - good idea to ask visitor what device should be
used.

<pre>
    castApi.addReceiverListener(consumer.applicationID, onReceiverList);
</pre>

    In order to start playback, we have to call API's
    [**launch**](https://developers.google.com/cast/reference/chrome/jsdoc/cast.LaunchRequest) method
    in order to launch our activity on receiver. Receiver can be busy with another cast, thus we have to 'book' it first.
    We also need to prepare request to load new media into the receiver application. This can be done with
    [cast.MediaLoadRequest](https://developers.google.com/cast/reference/chrome/jsdoc/cast.MediaLoadRequest).
    We are interested in  src field - url of media file to open, passed in the constructor + setting autoplay property
    to true - so the playback is started immediately.

<pre>
    function castMedia(mediaurl) {

              var result = new $.Deferred();
              var currentReceiver = castAPIConsumer.getCastingDevice();
              var launchRequest = new cast.LaunchRequest(castAPIConsumer.applicationID, currentReceiver);
              launchRequest.parameters = '';

              var loadRequest = new cast.MediaLoadRequest(mediaurl);
              loadRequest.autoplay = true;

              castApi.launch(launchRequest, function(status) {
                if (status.status == 'running') {
                  castApi.loadMedia(status.activityId,
                                          loadRequest,
                                          result.resolve);
                } else {
                    result.reject(status);
                }
              });

             return result;

            }
</pre>

## Points of Interest

Althouth SDK is still in beta, potential of this cheap HDMI gadget is too big to ignore it in your websites.
Please visit Cast API reference on [https://developers.google.com/cast/reference/](https://developers.google.com/cast/reference/)
for more details.

## History

1.0 - initial version of the article - notes on preparing environment + draft example that demonstrates
    launching of the playback on a device. No sophisticated API nor errors handling.
