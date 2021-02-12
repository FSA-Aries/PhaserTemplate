import Phaser from "phaser";

const formatScore = (score) => `Score: ${score}`;

export default class Score extends Phaser.GameObjects.Text {
  constructor(
    scene,
    x,
    y,
    score,
    style = {
      fontSize: "32px",
      strokeThickness: 6,
      color: "#E3E3E3",
    },
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
