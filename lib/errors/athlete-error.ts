// Custom error class for athlete not found scenarios
export class AthleteNotFoundError extends Error {
  statusCode: number;
  athleteId: string;

  constructor(message: string, athleteId: string) {
    super(message);
    this.name = "AthleteNotFoundError";
    this.statusCode = 404;
    this.athleteId = athleteId;
  }
}
