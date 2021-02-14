export function gameSceneNext() {
  this.scene.time.addEvent({
    delay: 3000,
    callback: () => {
      let text1 = this.add.text(
        310,
        370,
        "Guess this world been overrun by monsters",
        {
          fontSize: "10px",
          color: "white",
        }
      );

      this.scene.time.addEvent({
        delay: 3000,
        callback: () => {
          text1.setText("That voice on the radio mentioned a safe place...");

          this.scene.time.addEvent({
            delay: 3000,
            callback: () => {
              text1.setText("Guess I'd better head over and check it out.");
            },
          });
        },
      });
    },
  });
}
