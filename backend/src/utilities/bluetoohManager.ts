import * as noble from 'noble';
import { SyncEvent } from 'ts-events';
import { Configuration } from '../config';
import { BluetoothDevice } from '../models/sharedInterfaces';
import { logger } from './logger';
import { inspect } from 'util';
interface BluetoothState {
    state: "unknown" | "resetting" | "unsupported" | "unauthorized" | "poweredOff" | "poweredOn";
    isScanning: boolean;
}

export class BluetoothManager {
    private devices: BluetoothDevice[] = [];
    private bluetooth: BluetoothState = {
        state: "unknown",
        isScanning: false
    }
    public deviceUpdate: SyncEvent<BluetoothDevice[]> = new SyncEvent<BluetoothDevice[]>();


    /**
     * Initialize bluetooth.
     * 
     * When invoke this method, bluetooth will start scanning devices when bluetooth is ready.
     */
    Initialize(): void {
        let timer: NodeJS.Timeout | null = null;
        logger.info("[BluetoothManager] Initializing.");

        const clearTimer = () => {
            if (timer !== null) {
                clearTimeout(timer);
            }
        }

        const onStateChange = () => {
            if (this.bluetooth.state !== "poweredOn" && this.bluetooth.isScanning) {
                noble.stopScanning();
                return;
            }

            if (this.bluetooth.state === "poweredOn" && !this.bluetooth.isScanning) {
                noble.startScanning();
                clearTimer();
                timer = setTimeout(() => noble.stopScanning(), 30000);
            }
        }

        noble.on('stateChange', (state) => {
            this.bluetooth.state = state as any;
            onStateChange();
            if (state === 'poweredOn') {
                logger.info(`[BluetoothManager] state:${state}`);
            } else {
                logger.info(`[BluetoothManager] state:${state}`);
            }
        });

        noble.on("discover", (peripheral) => {
            const localName = peripheral.advertisement.localName;
            const uuid = peripheral.uuid;

            logger.info("[BluetoothManager] device discovered.");
            // logger.info(`[noble] device id:${peripheral.id}  uuid:${peripheral.uuid}  addressType:${peripheral.addressType}`);.
            logger.info('[BluetoothManager] Found device with local name: ' + localName);
            logger.info('[BluetoothManager] advertising the following service uuid\'s: ' + uuid);
            // logger.info(inspect(peripheral));
            // logger.info("");

            const newDeviceData = {
                uuid: uuid,
                name: localName || '------------',
                // deviceType: '------------',
                rssi: peripheral.rssi,
                serviceUuids: peripheral.advertisement.serviceUuids,
                connectionState: peripheral.state,
                connectable: peripheral.connectable,
                addressType: peripheral.addressType,
                address: peripheral.address
            };
            const deviceIndex = this.devices.findIndex(item => item.uuid === uuid);
            if (deviceIndex === -1) {
                this.devices.push(newDeviceData);
            }
            else {
                Object.assign(this.devices[deviceIndex], newDeviceData);
            }
            this.deviceUpdate.post(this.devices);
        });

        noble.on("scanStart", () => {
            this.bluetooth.isScanning = true;
            onStateChange();
            logger.info("[BluetoothManager] start scanning.");
        });

        noble.on("scanStop", () => {
            this.bluetooth.isScanning = false;
            onStateChange();
            logger.info("[BluetoothManager] stop scanning.");
        });
    }

    /**
     * Scan bluetooth devices
     * @returns BluetoothDevice collection
     */
    async getDevices(): Promise<BluetoothDevice[]> {
        if (Configuration.runningMode === 'test') {
            return [];
        }

        return this.devices;
    }
}

export const BluetoothManagerSingleton = new BluetoothManager();