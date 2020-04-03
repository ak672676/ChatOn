import { Component, OnInit, Input } from "@angular/core";
import { ApiService } from "../api.service";
import { LocalStorageService } from "../local-storage.service";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.css"]
})
export class PostComponent implements OnInit {
  @Input() post;
  constructor(private api: ApiService, private storage: LocalStorageService) {}

  ngOnInit() {
    function removeLeadingNumbers(string) {
      function isNumber(n) {
        n = Number(n);
        if (!isNaN(n)) {
          return true;
        }
      }
      if (string && isNumber(string[0])) {
        string = removeLeadingNumbers(string.substr(1));
      }
      return string;
    }
    this.fakeId = removeLeadingNumbers(this.post._id);
    if (this.post.content.length < 40) {
      this.fontSize = 22;
    }
    if (this.post.content.length < 24) {
      this.fontSize = 28;
    }
    if (this.post.content.length < 14) {
      this.fontSize = 32;
    }
    if (this.post.content.length < 8) {
      this.fontSize = 44;
    }
    if (this.post.content.length < 5) {
      this.fontSize = 62;
      this.align = "center";
    }

    this.userId = this.storage.getParsedToken()._id;
    if (this.post.likes.includes(this.userId)) {
      this.liked = true;
    }

    console.log("-------------------------");
    console.log("-------------------------");
    console.log(this.post);
    console.log("-------------------------");
  }
  public fakeId: string = "fakeId";
  public fontSize: number = 18;
  public align: string = "left";

  public liked: boolean = false;
  public userId: string = "";
  public comment: string = "";

  public likeButtonClicked(postid) {
    console.log("Like or dislike", postid);
    let requestObject = {
      location: `users/like-unlike/${this.post.ownerid}/${this.post._id}`,
      type: "POST",
      authorize: true
    };

    this.api.makeRequest(requestObject).then(val => {
      console.log(val);
      if (this.post.likes.includes(this.userId)) {
        this.post.likes.splice(this.post.likes.indexOf(this.userId), 1);
        this.liked = false;
      } else {
        this.post.likes.push(this.userId);
        this.liked = true;
      }
    });
  }
  public postComment() {
    if (this.comment.length == 0) {
      return;
    }
    console.log("Commenting...", this.comment);

    let requestObject = {
      location: `users/post-comment/${this.post.ownerid}/${this.post._id}`,
      type: "POST",
      authorize: true,
      body: { content: this.comment }
    };
    this.api.makeRequest(requestObject).then(val => {
      console.log(val);
      if (val.statusCode == 201) {
        let newComment = {
          ...val.comment,
          commenter_name: val.commenter.name,
          commenter_profile_image: val.commenter.profile_image
        };
        console.log(newComment);
        this.post.comments.push(newComment);
        this.comment = "";
      }
    });
  }
}
