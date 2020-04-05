import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { LocalStorageService } from "../local-storage.service";
import { ApiService } from "../api.service";
import { EventEmitterService } from "../event-emitter.service";

@Component({
  selector: "app-page-feed",
  templateUrl: "./page-feed.component.html",
  styleUrls: ["./page-feed.component.css"]
})
export class PageFeedComponent implements OnInit {
  constructor(
    private api: ApiService,
    private title: Title,
    private storage: LocalStorageService,
    private events: EventEmitterService
  ) {}

  ngOnInit() {
    this.title.setTitle("ChatOn - Your Feed");
    let requestObject = {
      method: "GET",
      location: "users/generate-feed"
    };
    this.api.makeRequest(requestObject).then(val => {
      if (val.statusCode === 200) {
        let fullCOl1 = val.posts.filter((val, i) => i % 4 === 0);
        let fullCOl2 = val.posts.filter((val, i) => i % 4 === 1);
        let fullCOl3 = val.posts.filter((val, i) => i % 4 === 2);
        let fullCOl4 = val.posts.filter((val, i) => i % 4 === 3);

        let cols = [fullCOl1, fullCOl2, fullCOl3, fullCOl4];

        this.addPostToFeed(cols, 0, 0);
      } else {
        console.log("Something went worng your feeds can not be created");
        this.events.onAlertEvent.emit(
          "Something went worng your feeds can not be created"
        );
      }
    });
  }

  public posts = {
    col1: [],
    col2: [],
    col3: [],
    col4: []
  };
  public newPostContent: string = "";
  public newPostTheme: string = this.storage.getPostTheme() || "primary";

  public changeTheme(newTheme) {
    this.newPostTheme = newTheme;
    console.log(this.newPostTheme);
    this.storage.setPostTheme(newTheme);
  }

  public createPost() {
    if (this.newPostContent.length == 0) {
      return this.events.onAlertEvent.emit(
        "No content for your post was provided."
      );
    }
    console.log("Create Post");
    let requestObject = {
      location: "users/create-post",
      method: "POST",
      body: {
        theme: this.newPostTheme,
        content: this.newPostContent
      }
    };

    this.api.makeRequest(requestObject).then(val => {
      if (val.statusCode == 201) {
        // alert("AMIT");
        val.newPost.ago = "Now";
        this.posts.col1.unshift(val.newPost);
      } else {
        this.events.onAlertEvent.emit(
          "Something went worng your post can not be created"
        );
      }
      this.newPostContent = "";
    });
  }
  private addPostToFeed(array, colNumber, delay) {
    setTimeout(() => {
      if (array[colNumber].length) {
        this.posts["col" + (colNumber + 1)].push(
          array[colNumber].splice(0, 1)[0]
        );
        colNumber = ++colNumber % 4;
        this.addPostToFeed(array, colNumber, 100);
      }
    }, delay);
  }
}
