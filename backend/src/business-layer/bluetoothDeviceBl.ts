import { SyncEvent } from 'ts-events';
import { BluetoothDevicesDal, BluetoothDevicesDalSingleton } from '../data-layer/bluetoothDevicesDal';
import { DeviceKind, BluetoothDevice } from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { BluetoothManager, BluetoothManagerSingleton } from '../utilities/bluetoohManager';
import { logger } from '../utilities/logger';

export class BluetoothDevicesBl {
    /**
     * Local devices changes feed.
     */
    public devicesUpdate = new SyncEvent<BluetoothDevice[]>();
    // Dependencies
    private bluetoothManager: BluetoothManager;
    private bluetoothDevicesDal: BluetoothDevicesDal;
    private modulesManager: ModulesManager;
    private isInitialized: boolean = false;

    /**
     * local devices.
     */
    private localDevices: BluetoothDevice[] = [];
    /**
     * use for cached data.
     */
    private cachedDevices: BluetoothDevice[] = [];

    /**
     * Init BluetoothDevicesBl . using dependecy injection pattern to allow units testings.
     * @param bluetoothDevicesDal Inject devices dal.
     * @param bluetoothReader Inject the reader function.
     * @param modulesManager ???
     */
    constructor(
        bluetoothDevicesDal: BluetoothDevicesDal,
        bluetoothManager: BluetoothManager,
        modulesManager: ModulesManager,
    ) {
        this.bluetoothDevicesDal = bluetoothDevicesDal;
        this.bluetoothManager = bluetoothManager;
        this.modulesManager = modulesManager;
        this.onDeviceUpdate = this.onDeviceUpdate.bind(this);
        this.bluetoothManager.deviceUpdate.attach(this.onDeviceUpdate);
    }

    /**
     * Initialize bluetooth controller.
     */
    public initBluetooth(): void {
        if (this.isInitialized)
            return;

        logger.info("[BluetoothBL] Initialize bluetooth controller.")
        this.isInitialized = true;
        this.bluetoothManager.Initialize();
    }

    /**
     * Get all local network devices
     */
    public async getDevices(): Promise<BluetoothDevice[]> {
        logger.info("----------get bluetooth Devices-----------")
        return this.localDevices;
    }

    /**
     * Set name to device.
     * @param deviceToSet Device to cached.
     */
    public async setDeviceName(deviceToSet: BluetoothDevice): Promise<void> {
        await this.bluetoothDevicesDal.saveDevice(deviceToSet);
        const localDevice = this.localDevices.find(d => d.uuid === deviceToSet.uuid);
        localDevice.name = deviceToSet.name;
        this.devicesUpdate.post(this.localDevices);
    }

    /**
     * Rescan bluetooth devices.
     */
    public async rescanBluetooth(): Promise<void> {
        await this.loadDevices();
        this.devicesUpdate.post(this.localDevices);
    }

    /**
     * Get devices models kinds array.
     */
    public async getDevicesKins(): Promise<DeviceKind[]> {
        return this.modulesManager.devicesKind;
    }

    /**
     * Load bluetooth devices data.
     */
    private async loadDevices(newDevices?: BluetoothDevice[]): Promise<void> {
        this.cachedDevices = await this.bluetoothDevicesDal.getDevices();

        // Read the bluetooth devices
        let bluetoothDevices: BluetoothDevice[] = [];
        if (newDevices === undefined)
            bluetoothDevices = await this.bluetoothManager.getDevices();
        else
            bluetoothDevices = newDevices;
        const unknown = '------------';

        // Set the cached name if cached
        for (const bluetoothDevice of bluetoothDevices) {
            const localDevice = this.cachedDevices.find(d => d.uuid === bluetoothDevice.uuid);
            bluetoothDevice.name = localDevice?.name || unknown;
        }

        // Collect all cached devices that not found in the network
        const unconnectedDevices: BluetoothDevice[] = [];
        for (const cachedDevice of this.cachedDevices) {
            if (!bluetoothDevices.some(d => d.uuid === cachedDevice.uuid)) {
                cachedDevice.name = '';
                unconnectedDevices.push(cachedDevice);
            }
        }

        // Merge all devices into one collection, while the network devices in the first
        this.localDevices = [...bluetoothDevices, ...unconnectedDevices];
    }

    private onDeviceUpdate(devices: BluetoothDevice[]): void {
        logger.info("[BluetoothDeviceBl] onDeviceUpdate")
        this.loadDevices(devices);
    }
}

export const BluetoothDevicesBlSingleton = new BluetoothDevicesBl(BluetoothDevicesDalSingleton, BluetoothManagerSingleton, ModulesManagerSingltone);
