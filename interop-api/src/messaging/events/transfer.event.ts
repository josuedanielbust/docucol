export class InitiateTransferEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: string,
    public readonly action: string
  ) {}
}

export class CompleteTransferEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: string,
    public readonly action: string
  ) {}
}