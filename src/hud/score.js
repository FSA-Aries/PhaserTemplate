import Phaser from "phaser";

const formatScore = (score) => `Score: ${score}`;

export default class Score extends Phaser.GameObjects.Text {
  constructor(
    scene,
    x,
    y,
    score,
    style = { fontSize: "32px", fill: "#999" },
    scale = 1
  ) {
    super(scene, x, y, formatScore(score), style);

    this.score = score;
  }

  setScore(score) {
    this.score = score;
    this.updateScoreText();
  }

  addPoints(points) {
    this.setScore(this.score + points);
  }

  updateScoreText() {
    this.setText(formatScore(this.score));
  }
}
