import { Post } from './post';
import { Comment } from './comment'; 

export class Content {
  
  post: Post;
  comments?: Comment[];
  commentAmount?: number;
  likes?: number;
}

