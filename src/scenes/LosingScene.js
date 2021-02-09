import Phaser from "phaser";

const formatScore = (score, secondScore) =>
  `You lost by ${secondScore - score} points :(!`;

export default class LosingScene extends Phaser.GameObjects.Text {
  constructor(
    scene,
    x,
    y,
    score,
    secondScore,
    style = { fontSize: "40px", fill: "#999" }
  ) {
    super(scene, x, y, formatScore(score, secondScore), style);
    this.score = score;
    this.secondScore = secondScore;
  }
}
