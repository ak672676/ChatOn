import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { LocalStorageService } from "../local-storage.service";
import { EventEmitterService } from "../event-emitter.service";
import { UserDataService } from "../user-data.service";
import { ApiService } from "../api.service";
import { AutoUnsubscribe } from "../unsubscribe";
@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"],
})
@AutoUnsubscribe
export class TopbarComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: LocalStorageService,
    private events: EventEmitterService,
    private centralUserData: UserDataService,
    private api: ApiService
  ) {}

  ngOnInit() {
    // let token = this.storage.getToken();

    this.usersName = this.storage.getParsedToken().name;
    this.usersId = this.storage.getParsedToken()._id;

    let alertEvent = this.events.onAlertEvent.subscribe((msg) => {
      this.alertMessage = msg;
    });

    let friendRequestEvent = this.events.updateNumOfFriendRequestsEvent.subscribe(
      (msg) => {
        // this.numOfFriendRequests--;
        this.notifications.friendRequests--;
      }
    );

    let userDataEvent = this.centralUserData.getUserData.subscribe((user) => {
      // console.log(user.messages);
      this.notifications.friendRequests = user.friend_requests.length;
      this.notifications.messages = user.new_message_notifications.length;
      this.profilePicture = user.profile_image;

      this.setMessagePreviews(user.messages, user.new_message_notifications);
      console.log(this.messagePreviews);
      console.log("________________________________________");
    });

    let updateMessageEvent = this.events.updateSendMessageObjectEvent.subscribe(
      (d) => {
        this.sendMessageObject.id = d.id;
        this.sendMessageObject.name = d.name;
      }
    );

    let requestObject = {
      location: `users/get-user-data/${this.usersId}`,
      method: "GET",
    };

    let resetMessageEvent = this.events.resetMessageNotificationsEvent.subscribe(
      () => {
        this.notifications.messages = 0;
      }
    );

    this.api.makeRequest(requestObject).then((val) => {
      this.centralUserData.getUserData.emit(val.user);
    });

    this.subscriptions.push(
      alertEvent,
      friendRequestEvent,
      userDataEvent,
      updateMessageEvent,
      resetMessageEvent
    );
  }

  private query: String = "";
  private subscriptions = [];
  public sendMessageObject = {
    id: "",
    name: "",
    content: "",
  };
  public alertMessage: string = "";

  // userData
  public usersName: string = "";
  public usersId: string = "";
  public profilePicture: string = "default-avatar";
  public messagePreviews = [];
  public notifications = {
    alerts: 0,
    friendRequests: 0,
    messages: 0,
  };
  // public userData: object = {};
  // public numOfFriendRequests: number = 0;

  public searchForFriends() {
    this.router.navigate(["/search-results", { query: this.query }]);
  }

  public sendMessage() {
    this.api.sendMessage(this.sendMessageObject);
    this.sendMessageObject.content = "";
  }

  public resetMessageNotifications() {
    this.api.resetMessageNotifications();
  }

  private setMessagePreviews(messages, messageNotifications) {
    for (let i = messages.length - 1; i >= 0; i--) {
      let lastMessage = messages[i].content[messages[i].content.length - 1];
      let preview = {
        messengerName: messages[i].messengerName,
        messageContent: lastMessage.message,
        messengerImage: "",
        messengerId: messages[i].from_id,
        isNew: false,
      };
      if (lastMessage.messenger == this.usersId) {
        preview.messengerImage = this.profilePicture;
      } else {
        preview.messengerImage = messages[i].messengerProfileImage;
        if (messageNotifications.includes(messages[i].from_id)) {
          preview.isNew = true;
        }
      }
      if (preview.isNew) {
        this.messagePreviews.unshift(preview);
      } else {
        this.messagePreviews.push(preview);
      }
    }
  }
}
