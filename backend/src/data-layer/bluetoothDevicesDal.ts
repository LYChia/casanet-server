import { IDataIO } from '../models/backendInterfaces';
import { BluetoothDevice, User } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const DEVICES_FILE_NAME = 'bluetooth-devices.json';

/**
 * Used only to save devices name map to mac address. not any other use.
 */
export class BluetoothDevicesDal {
  private dataIo: IDataIO;

  /**
   * Kept Devices.
   */
  private devices: BluetoothDevice[] = [];

  constructor(dataIo: IDataIO) {
    this.dataIo = dataIo;

    this.devices = dataIo.getDataSync();
  }

  /**
   * Get all saved devices as array.
   */
  public async getDevices(): Promise<BluetoothDevice[]> {
    return this.devices;
  }

  /**
   * Save new device mac name map.
   */
  public async saveDevice(deviceToSave: BluetoothDevice): Promise<void> {
    const originalDevice = this.findDevice(deviceToSave.uuid);

    if (originalDevice) {
      this.devices.splice(this.devices.indexOf(originalDevice), 1);
    }

    this.devices.push(deviceToSave);

    await this.dataIo.setData(this.devices).catch(() => {
      this.devices.splice(this.devices.indexOf(deviceToSave), 1);

      if (originalDevice) {
        this.devices.push(originalDevice);
      }

      throw new Error('fail to save device');
    });
  }

  /**
   * Remove device name map.
   */
  public async removeDevice(deviceToRemove: BluetoothDevice): Promise<void> {
    const originalDevice = this.findDevice(deviceToRemove.uuid);

    if (!originalDevice) {
      throw new Error('device not saved');
    }

    this.devices.splice(this.devices.indexOf(originalDevice), 1);
    await this.dataIo.setData(this.devices).catch(() => {
      this.devices.push(originalDevice);
      throw new Error('fail to save device removed request');
    });
  }

  /**
   * Find device in devices array
   */
  private findDevice(uuid: string): BluetoothDevice {
    for (const device of this.devices) {
      if (device.uuid === uuid) {
        return device;
      }
    }
  }
}

export const BluetoothDevicesDalSingleton = new BluetoothDevicesDal(new DataIO(DEVICES_FILE_NAME));
