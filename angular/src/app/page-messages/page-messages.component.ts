import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ApiService } from "../api.service";

@Component({
  selector: "app-page-messages",
  templateUrl: "./page-messages.component.html",
  styleUrls: ["./page-messages.component.css"],
})
export class PageMessagesComponent implements OnInit {
  constructor(private title: Title, private api: ApiService) {}

  ngOnInit() {
    this.title.setTitle("ChatOn - Your Messages");
    this.api.resetMessageNotifications();
  }
}
