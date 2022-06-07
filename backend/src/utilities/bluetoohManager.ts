import noble from 'noble';
import { Configuration } from '../config';
import { BluetoothDevice } from '../models/sharedInterfaces';
import { logger } from './logger';
import { scanLocalNetwork } from 'local-network-scan';

// noble.startScanning(); // any service UUID, no duplicates


// noble.startScanning([], true); // any service UUID, allow duplicates


// var serviceUUIDs = ["<service UUID 1>", ...]; // default: [] => all
// var allowDuplicates = <false|true>; // default: false

// noble.startScanning(serviceUUIDs, allowDuplicates[, callback(error)]); // particular UUID's

/**
 * Scan local network devices
 * @returns BluetoothDevice collection
 */
//export async function BluetoothReader(): Promise<BluetoothDevice[]> {
export async function BluetoothReader(): Promise<void> {
    // 先註解起來 要用再自行修改

    /** Check if internet connection is online, otherwise don't try to get vendor name. */
    // const isInternetOnline = await isOnline();

    // if (Configuration.runningMode === 'test') {
    //     return [];
    // }

    // try {
    //     logger.info('[BluetoothReader] Scanning network devices...');
    //     const networkDevices = await scanLocalNetwork({
    //         logger,
    //         localNetwork: Configuration.scanSubnet,
    //         queryVendor: isInternetOnline,
    //     });
    //     logger.info('[BluetoothReader] Scanning network devices done.');

    //     const devices: BluetoothDevice[] = [];
    //     /** Add current machine info to table (without the MAC address!!!, then mac used as part of the default authentication) */
    //     devices.push({
    //         mac: '------------',
    //         ip: ip.address(),
    //         vendor: 'Casanet Local Server',
    //     });

    //     for (const localDevice of networkDevices) {
    //         // Skip devices without mac
    //         if (!localDevice.mac) {
    //             continue;
    //         }
    //         devices.push({
    //             // Show clean MAC string without ':', '-' or '_'
    //             mac: localDevice.mac?.replace(/:|-|_| /g, '').toLowerCase(),
    //             ip: localDevice.ip,
    //             vendor: localDevice.vendor,
    //         });
    //     }
    //     return devices;
    // } catch (error) {
    //     if (error.message === 'Timeout') {
    //         console.error('[BluetoothReader] Scanning network devices scanning timeout');
    //     }
    //     logger.error(`[BluetoothReader] Scanning network devices failed - ${error?.message}`);
    //     return [];
    // }
}