import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class EventEmitterService {
  onAlertEvent: EventEmitter<string> = new EventEmitter();
  updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter();
  constructor() {}
}
