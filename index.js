const q = require('daskeyboard-applet');

const logger = q.logger;
const queryUrlBase = 'https://3.basecampapi.com';

class Basecamp extends q.DesktopApp {
  constructor() {
    super();
    // run every mintutes
    this.pollingInterval = 60 * 1000;
  }

  async applyConfig() {
    logger.info("Basecamp3 initialisation.");

    // Array to keep in mind the projects name and update date.
    this.updated_at = {};

    // User ID
    this.userId = this.config.userId;

    // Only if userId is definded
    if(this.userId){

      // first get all the user projects
      await this.getAllProjects().then((projects) => {

        logger.info("Let's configure the project table by getting the time.");

        for (let project of projects) {
          // Get update_at for each project
          this.updated_at[project.name] = project.updated_at;
        }

      })
      .catch(error => {
        logger.error(
          `Got error sending request to service: ${JSON.stringify(error)}`);
      });

    }else{
      logger.info("UserId is not defined.");
    }

  }

  // Get all the user projects
  async getAllProjects() {
    const query = `/${this.userId}/projects.json`;
    const proxyRequest = new q.Oauth2ProxyRequest({
      apiKey: this.authorization.apiKey,
      uri: queryUrlBase + query
    });
    return this.oauth2ProxyRequest(proxyRequest);
  }

  async run() {
    logger.info("Basecamp3 running.");
    return this.getAllProjects().then(projects => {
      let triggered = false;
      let message = [];
      this.url = "";
      var notification = 0;

      for (let project of projects) {

        if(project.updated_at > this.updated_at[project.name]){

          // Need to send a signal         
          triggered=true;
          logger.info("Got an update in:" + project.name);

          // Need to update the time of the project which got an update
          this.updated_at[project.name] = project.updated_at;

          // Update signal's message
          message.push(`Update in ${project.name} project.`);

          // Update url:
          // if there are several notifications on different projects:
          // the url needs to redirect on the projects page
          if(notification >= 1){
            this.url = `https://3.basecamp.com/${this.userId}/projects/`;
          }else{
            this.url = project.app_url;
          }
          notification = notification +1;

        }

      }

      if (triggered) {
        return new q.Signal({
          points: [
            [new q.Point(this.config.color, this.config.effect)]
          ],
          name: `Basecamp`,
          message: message.join("<br>"),
          link: {
            url: this.url,
            label: 'Show in Basecamp',
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
          'The Basecamp service returned an error. <b>Please check your internet connection</b>.'
        );
      }
      return q.Signal.error([
        'The Basecamp service returned an error. <b>Please check your user ID and account</b>.',
        `Detail: ${error.message}`]);
    });
  }
}


module.exports = {
  Basecamp: Basecamp
}

const applet = new Basecamp();