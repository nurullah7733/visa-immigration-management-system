export type InviteStatus = "pending" | "accepted";
export interface Invite {
  email: string;
  token: string;
  status: InviteStatus;
}
