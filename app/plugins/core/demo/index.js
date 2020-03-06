import Logger from "../../../lib/logger";
import logoOkta from "./logos/okta.png";
import logoChipi from "./logos/chipi.png";
import logoQuicksight from "./logos/quicksight.png";
import { shell, clipboard } from "electron";

var logger = new Logger("plugins.demo");

// Settings plugin name
const NAME = "demo";
const matchingTerms = {
  okta: {
    resultItem: {
      id: "demo-okta",
      account: "chipi.io",
      icon: logoOkta,
      title: "okta - My Applications",
      onSelect: event => {
        shell.openExternal("https://xero.okta.com/login/login.htm?fromURI=%2Fapp%2FUserHome");
        event.preventDefault();
      }
    }
  },
  "Alc-Team": {
    resultItem: {
      id: "demo-Alc-Team",
      account: "chipi.io",
      icon: logoChipi,
      title: "Alc Team",
      subtitle:
        "https://www.n4l.co.nz/, https://www.xero.com/blog/2016/12/bumps-in-the-road-and-what-were-doing-about-them/, https://www.workflowmax.com/blog/preview-the-new-workflowmax-ui-part-3-global-search, https://www.xero.com/blog/2017/04/3-challenges-secure-migration-aws/, https://www.xero.com/nz/",
      onSelect: event => {
        shell.openExternal("https://www.n4l.co.nz/");
        shell.openExternal(
          "https://www.xero.com/blog/2016/12/bumps-in-the-road-and-what-were-doing-about-them/"
        );
        shell.openExternal(
          "https://www.workflowmax.com/blog/preview-the-new-workflowmax-ui-part-3-global-search"
        );
        shell.openExternal("https://www.xero.com/blog/2017/04/3-challenges-secure-migration-aws/");
        shell.openExternal("https://www.xero.com/nz/");
        event.preventDefault();
      }
    }
  },
  "Alc-Problem": {
    resultItem: {
      id: "demo-Alc-Problem",
      account: "chipi.io",
      icon: logoOkta,
      title: "Alc Problem",
      subtitle:
        "https://xero.okta.com/app/UserHome, https://xero.slack.com/stats#overview",
      onSelect: event => {
        shell.openExternal("https://xero.okta.com/app/UserHome");
        shell.openExternal("https://xero.slack.com/stats#overview");
        event.preventDefault();
      }
    }
  },
  "Alc-Solution": {
    resultItem: {
      id: "demo-Alc-Solution",
      account: "chipi.io",
      icon: logoChipi,
      title: "Alc Solution",
      subtitle:
        "https://xero.slack.com/apps/manage, https://drive.google.com/file/d/1c12ync6-PJFfDaUXwQEMH5RDS6xYZM4a/view?usp=sharing",
      onSelect: event => {
        shell.openExternal("https://xero.slack.com/apps/manage");
        shell.openExternal(
          "https://drive.google.com/file/d/1c12ync6-PJFfDaUXwQEMH5RDS6xYZM4a/view?usp=sharing"
        );
        event.preventDefault();
      }
    }
  },
  "Alc-Traction": {
    resultItem: {
      id: "demo-Alc-Traction",
      account: "chipi.io",
      icon: logoQuicksight,
      title: "Alc Traction",
      subtitle:
        "https://ap-southeast-2.quicksight.aws.amazon.com/sn/dashboards/9cb207bb-cd08-4439-9ba7-58c631efd229#",
      onSelect: event => {
        shell.openExternal(
          "https://ap-southeast-2.quicksight.aws.amazon.com/sn/dashboards/9cb207bb-cd08-4439-9ba7-58c631efd229#"
        );
        event.preventDefault();
      }
    }
  },
  "Alc-Opportunity": {
    resultItem: {
      id: "demo-Alc-Opportunity",
      account: "chipi.io",
      icon: logoOkta,
      title: "Alc Opportunity",
      subtitle:
        "https://www.okta.com/businesses-at-work/2019/, https://www.okta.com/company/, https://9to5google.com/2019/02/04/g-suite-5-million-businesses/",
      onSelect: event => {
        shell.openExternal("https://www.okta.com/businesses-at-work/2019/");
        shell.openExternal("https://www.okta.com/company/");
        shell.openExternal("https://9to5google.com/2019/02/04/g-suite-5-million-businesses/");
        event.preventDefault();
      }
    }
  }
};

const order = -3;

/**
 * Plugin for CHIPI eater eggs
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({ term, display, actions }) => {
  const resultItems = Object.keys(matchingTerms).map(matchingTermKey => {
    if (!matchingTermKey.toLowerCase().startsWith(term.trim().toLowerCase())) {
      return;
    }

    const matchingTerm = matchingTerms[matchingTermKey];

    return matchingTerm.resultItem;
  });

  display(resultItems);
};

export default {
  fn,
  supportEmptyTerm: false,
  supportFilters: false,
  name: NAME
};
