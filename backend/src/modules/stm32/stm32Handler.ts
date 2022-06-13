import * as moment from 'moment';
import { Duration } from 'moment';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, BluetoothMinion, BluetoothMinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { Delay } from '../../utilities/sleep';
import { BluetoothBrandModuleBase } from '../bluetoothBrandModuleBase';

export class STM32Handler extends BluetoothBrandModuleBase {
  public readonly brandName: string = 'STM32';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: 1,
      model: 'STM32',
      supportedMinionType: 'fanOfStm32',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    }
  ];
  /**
   * Time duratin to mock pysical device status update for switch minion.
   */
  private readonly SWITCH_CHANGED_INTERVAL: Duration = moment.duration(4, 'seconds');

  /**
   * Time duratin to mock pysical device status update for ac minion.
   */
  private readonly AC_CHANGED_INTERVAL: Duration = moment.duration(5, 'seconds');

  constructor() {
    super();

    // for debug updattes remove 'return'
    return;
    setInterval(async () => {
      const minions = await this.retrieveMinions.pull();

      if (minions.length === 0 || !minions[0].minionStatus || !minions[0].minionStatus[minions[0].minionType]) {
        return;
      }

      const statusCopy = DeepCopy<BluetoothMinionStatus>(minions[0].minionStatus);

      const statusObject = statusCopy[minions[0].minionType] as Toggle;
      statusObject.status = statusObject.status === 'off' ? 'on' : 'off';

      this.minionStatusChangedEvent.post({
        minionId: minions[0].minionId,
        status: statusCopy,
      });
    }, this.SWITCH_CHANGED_INTERVAL.asMilliseconds());

    // setInterval(() => {
    //   this.minionStatusChangedEvent.post({
    //     minionId: '656565656',
    //     status: {
    //       airConditioning: {
    //         status: 'off',
    //         fanStrength: 'high',
    //         mode: 'cold',
    //         temperature: 20,
    //       },
    //     },
    //   });
    // }, this.AC_CHANGED_INTERVAL.asMilliseconds());
  }
  public async getStatus(minion: BluetoothMinion): Promise<BluetoothMinionStatus | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.

    switch (minion.device.model) {
      case 'fan':
        return {
          fan: {
            status: 'mode1',
          },
        };
    }

    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setStatus(minion: BluetoothMinion, setStatus: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
    if (
      minion.device.model === 'switch demo' ||
      minion.device.model === 'ac demo' ||
      minion.device.model === 'RF toggle demo' ||
      minion.device.model === 'Roller demo' ||
      minion.device.model === 'Light demo' ||
      minion.device.model === 'Temperature Light demo' ||
      minion.device.model === 'Color Light demo'
    ) {
      return;
    }

    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async enterRecordMode(minion: BluetoothMinion, statusToRecordFor: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
  }

  public async generateCommand(minion: BluetoothMinion, statusToRecordFor: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real command generation.
  }

  public async setFetchedCommands(minion: BluetoothMinion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }
}
