import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema(
  {
    onComment :{
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    onVideo:{
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    likedBy:{
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    onTweet:{
      type: Schema.Types.ObjectId,
      ref: "Tweet"
    }
  }
)

export const Like = mongoose.model("Like", likeSchema);