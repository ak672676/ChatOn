import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { EventEmitterService } from "../event-emitter.service";

import { AutoUnsubscribe } from "../unsubscribe";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
@AutoUnsubscribe
export class SidebarComponent implements OnInit {
  constructor(private auth: AuthService, private events: EventEmitterService) {}

  ngOnInit() {
    let userDataEvent = this.events.getUserData.subscribe((user) => {
      this.userData = user;
      this.besties = user.besties;
      this.enemies = user.enemies;
    });
    this.subscriptions.push(userDataEvent);
  }
  private subscriptions = [];
  public userData = {};
  public besties = [];
  public enemies = [];
}
