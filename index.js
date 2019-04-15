const q = require('daskeyboard-applet');

const logger = q.logger;
const queryUrlBase = 'https://todo.com';

class Reddit extends q.DesktopApp {
  constructor() {
    super();
    // run every mintutes
    this.pollingInterval = 60 * 1000;
  }

  async applyConfig() {
    logger.info("Reddit initialisation.");

  }

  async run() {
    logger.info("Reddit running.");
    let triggered = false;
    let message = [];
    this.url = "";
    var notification = 0;
    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: "https://www.reddit.com/r/api/live/happening_now"
    })
    return this.oauth2ProxyRequest(proxyRequest).then(body => {

      logger.info("This is the body response: "+JSON.stringify(body));

      // for (let project of projects) {

      //   if(project.updated_at > this.updated_at[project.name]){

      //     // Need to send a signal         
      //     triggered=true;
      //     logger.info("Got an update in:" + project.name);

      //     // Need to update the time of the project which got an update
      //     this.updated_at[project.name] = project.updated_at;

      //     // Update signal's message
      //     message.push(`Update in ${project.name} project.`);

      //     // Update url:
      //     // if there are several notifications on different projects:
      //     // the url needs to redirect on the projects page
      //     if(notification >= 1){
      //       this.url = `https://3.basecamp.com/${this.userId}/projects/`;
      //     }else{
      //       this.url = project.app_url;
      //     }
      //     notification = notification +1;

      //   }

      // }

      if (triggered) {
        return new q.Signal({
          points: [
            [new q.Point(this.config.color, this.config.effect)]
          ],
          name: `Reddit`,
          message: message.join("<br>"),
          link: {
            url: this.url,
            label: 'Show in Reddit',
          },
        });
      } else {
        logger.info("None udpate received.");
        return null;
      }

    }).catch(error => {
      logger.error(
        `Got error sending request to service: ${JSON.stringify(error)}`);
      if(`${error.message}`.includes("getaddrinfo")){
        return q.Signal.error(
          'The Reddit service returned an error. <b>Please check your internet connection</b>.'
        );
      }
      return q.Signal.error([
        'The Reddit service returned an error. <b>Please check your account</b>.',
        `Detail: ${error.message}`]);
    });
  }
}


module.exports = {
  Reddit: Reddit
}

const applet = new Reddit();