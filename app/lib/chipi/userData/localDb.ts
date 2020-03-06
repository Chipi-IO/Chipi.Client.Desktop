import Logger from "../../../lib/logger";
import { isDev } from "Environment";
import Dexie from "dexie";
import debounce from "lodash/debounce";
import textHelper from "./textHelper";

const dbName = `ChipiLocalDb${isDev() ? "-dev" : ""}`;
const logger = new Logger("lib.chipi.userData.localDb");

export default class LocalDb extends Dexie {
  persons: Dexie.Table<any, string>;
  settings: Dexie.Table<any, string>;
  channels: Dexie.Table<any, string>;
  tunnels: Dexie.Table<any, string>;
  tags: Dexie.Table<any, string>;
  connects: Dexie.Table<any, string>;

  /*tags: Dexie.Table<Tag, string>;
  localSettings: Dexie.Table<LocalSetting, string>;*/

  constructor(username: string) {
    super(`${dbName}-${username}`);

    this.version(1).stores({
      persons: "++id, rawIdentity.id",
      settings: "++name"
    });

    this.version(2)
      .stores({
        _personsIndex: "++,*nameTerm,email,fromChannel,personId"
      })
      .upgrade((tx: any) => {
        return Promise.all([tx.settings.clear(), tx.persons.clear()]);
      });

    this.version(3).stores({
      channels: "++id, fromChannel"
    });

    this.version(4).upgrade((tx: any) => {
      return Promise.all([tx.settings.clear(), tx.persons.clear()]);
    });

    this.version(5).stores({
      _personsIndex: "++,*nameTerm,email,fromChannel,personId,normalizedName"
    });

    this.version(6)
      .stores({
        persons:
          "++id,rawIdentity.id,*nameTermsLower,emailLower,fromChannel,personId,normalizedNameLower"
      })
      .upgrade((trans: any) => {
        trans._personsIndex.clear();

        return trans.persons.toCollection().modify((person: any) => {
          const personName = person.name ? person.name.replace(/\([^)]*\)*/g, "") : "";

          const normalizedName = textHelper.normalize(personName);
          person.normalizedName = normalizedName;
          person.nameTermsLower = person.name
            ? textHelper.getTermsForIndexing(personName.toLowerCase())
            : [];
          person.normalizedNameLower = normalizedName
            ? normalizedName.toLowerCase()
            : normalizedName;
          person.emailemailLower = person.email ? person.email.toLowerCase() : person.email;
        });
      });

    this.version(7)
      .stores({
        persons:
          "++id,rawIdentity.id,*nameTermsLower,emailLower,fromChannel,personId,normalizedNameLower,username",
        channels: "++id, fromChannel, username",
        _personsIndex: null
      })
      .upgrade((trans: any) => {
        return Promise.all([trans.channels.clear(), trans.persons.clear(), trans.settings.clear()]);
      });

    this.version(8).stores({
      tunnels: "++id,fromChannelId,fromChannel,name,rawType",
      channels: "++id, fromChannel, username, filterableTerm"
    });

    this.version(9).stores({
      tags: "++id, tagName, username"
    });

    this.version(10).stores({
      connects: "connectId, isActive"
    });

    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.persons = this.table("persons");
    this.settings = this.table("settings");
    this.channels = this.table("channels");
    this.tunnels = this.table("tunnels");
    this.tags = this.table("tags");
    this.connects = this.table("connects");
  }
}
