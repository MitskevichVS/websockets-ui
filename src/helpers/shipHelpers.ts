import { Ship, ShipResource } from "../types/types";

export const generateShipCoordinates = (
  ship: ShipResource
): { x: number; y: number; isAttacked: boolean }[] => {
  const pointsArray: { x: number; y: number; isAttacked: boolean }[] = [];

  const initialPosition = ship.position;

  for (let i = 0; i < ship.length; i += 1) {
    ship.direction
      ? pointsArray.push({
          x: initialPosition.x,
          y: initialPosition.y + i,
          isAttacked: false,
        })
      : pointsArray.push({
          x: initialPosition.x + i,
          y: initialPosition.y,
          isAttacked: false,
        });
  }

  return pointsArray;
};

const getHittedPoint = (
  ship: Ship,
  x: number,
  y: number
): { x: number; y: number; isAttacked: boolean } | undefined => {
  return ship.points.find(
    ({ x: pointX, y: pointY }) => pointX === x && pointY === y
  );
};

export const getAttackResult = (
  field: Ship[],
  x: number,
  y: number,
  indexPlayer: number
) => {
  let status = "miss";
  let point: { x: number; y: number; isAttacked: boolean } | undefined;
  const hittedShip = field.find((ship) => {
    point = getHittedPoint(ship, x, y);
    return point;
  });

  if (point) {
    point.isAttacked = true;
  }

  console.log("hittedShip", hittedShip);

  if (hittedShip) {
    status = "shot";
  }

  if (hittedShip?.points?.every((point) => point.isAttacked)) {
    status = "killed";
  }

  return {
    position: { x, y },
    indexPlayer,
    status,
    hittedShip,
  };
};

export const calculateSidePoints = (field: Ship[], ship: Ship) => {
  const { x, y } = ship.position;
  const points = [
    { x: x - 1, y },
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y },
    { x: x + 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x - 1, y: y + 1 },
  ];

  return points.filter(({ x, y }) => x >= 0 && x <= 9 && y >= 0 && y <= 9);
};
