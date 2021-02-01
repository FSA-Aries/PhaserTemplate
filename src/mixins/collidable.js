export default function addCollider(otherGameObject, callback) {
  this.scene.physics.add.collider(this, otherGameObject, callback, null, this);
}
