import RaycastApi from "raycast-backend-api";

const api = new RaycastApi();

const me = await api.me();
const models = await api.aiModels();

console.log(me);
console.log(models);