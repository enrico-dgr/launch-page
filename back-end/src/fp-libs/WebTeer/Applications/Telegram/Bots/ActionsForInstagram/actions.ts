interface tag {
  _tag: string;
}
interface Skip {
  skip: boolean;
}
interface ExpectedText {
  expectedText: string;
}
export interface Follow extends tag, Skip, ExpectedText {
  _tag: "Follow";
}
export interface Like extends tag, Skip, ExpectedText {
  _tag: "Like";
}
export interface Comment extends tag, Skip, ExpectedText {
  _tag: "Comment";
}
export interface Story extends tag, Skip, ExpectedText {
  _tag: "Story";
}
interface NoAct extends tag {
  _tag: "NoAct";
}
export type Action = Follow | Like | Comment | Story;
export const match: <A>(
  onFollow: (f: Follow) => A,
  onLike: (l: Like) => A,
  onComment: (c: Comment) => A,
  onStory: (s: Story) => A
) => (ma: Action) => A = (onFollow, onLike, onComment, onStory) => (ma) => {
  switch (ma._tag) {
    case "Follow":
      return onFollow(ma);
    case "Like":
      return onLike(ma);
    case "Comment":
      return onComment(ma);
    case "Story":
      return onStory(ma);
    default:
      throw new Error("Impossible case. Info: \n" + JSON.stringify(ma));
  }
};
