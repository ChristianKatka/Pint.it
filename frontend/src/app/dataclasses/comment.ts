export class Comment {
  
  public id: number;
  public text: string;
  public username: string;
  public post_id: number;
  public likes?: number;
  public createdAt: Date;
  public date: string;
  public img: string;
  public comment_owner?: any;
  public liked?: boolean;
}
