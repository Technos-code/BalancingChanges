import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { VFS } from "@spt/utils/VFS";
import { jsonc } from "jsonc";
import path from "path";

interface ModConfig 
{
    Foregrips: Record<string, ForegripSettings>;
    Bullets: Record<string, BulletSettings>;
    Suppressors: Record<string, SuppressorSettings>;
    Stocks: Record<string, StockSettings>;
    ArmoredMasksandHelmets: Record<string, ArmoredMaskandHelmetsSettings>;
    FleaBalance: Record<string, FleaBalanceSettings>;
}

interface ForegripSettings 
{
    Ergonomics: number;
    Recoil: number;
    fleaprice: number;
}

interface BulletSettings
{
    Penetration: number;
    Damage: number;
    ammoAccr: number;
    ammoRec: number;
    ArmorDamage: number;
    HeatFactor: number;
    DurabilityBurnModificator: number;
}

interface SuppressorSettings
{
    Accuracy: number;
    Recoil: number;
    Loudness: number;
    Ergonomics: number;
    Velocity: number;
    HeatFactor: number;
    CoolFactor: number;
    DurabilityBurnModificator: number;
    fleaprice: number;
}

interface StockSettings 
{
    Ergonomics: number;
    Recoil: number;
    Accuracy: number;
    fleaprice: number;
}

interface ArmoredMaskandHelmetsSettings
{
    armorClass: number;
    Durability: number;
    MaxDurability: number;
    BlocksHeadwear: boolean;
    armorColliders: string[];
    fleaprice: number;
}

interface FleaBalanceSettings
{
    fleaprice: number;
}

class Mod implements IPostDBLoadMod
{
    private modConfig: ModConfig;

    postDBLoad(container: DependencyContainer): void 
    {
        const vfs = container.resolve<VFS>("VFS");
        this.modConfig = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // Bridging our config file to the table edits        
        for (const foregripId in this.modConfig.Foregrips) 
        {
            const foregripSettings = this.modConfig.Foregrips[foregripId];

            if (tables.templates.items[foregripId] === undefined) continue;


            tables.templates.items[foregripId]._props.Ergonomics = foregripSettings.Ergonomics;
            tables.templates.items[foregripId]._props.Recoil = foregripSettings.Recoil;        
            tables.templates.prices[foregripId] = foregripSettings.fleaprice;
        }
        for (const bulletId in this.modConfig.Bullets) 
        {
            const bulletSettings = this.modConfig.Bullets[bulletId];

            if (tables.templates.items[bulletId] === undefined) continue;

            tables.templates.items[bulletId]._props.PenetrationPower = bulletSettings.Penetration;
            tables.templates.items[bulletId]._props.Damage = bulletSettings.Damage;
            tables.templates.items[bulletId]._props.ammoAccr = bulletSettings.ammoAccr;
            tables.templates.items[bulletId]._props.ammoRec = bulletSettings.ammoRec;
            tables.templates.items[bulletId]._props.ArmorDamage = bulletSettings.ArmorDamage;
            tables.templates.items[bulletId]._props.HeatFactor = bulletSettings.HeatFactor;
            tables.templates.items[bulletId]._props.DurabilityBurnModificator = bulletSettings.DurabilityBurnModificator;
        }
        for (const suppressorId in this.modConfig.Suppressors) 
        {
            const suppressorSettings = this.modConfig.Suppressors[suppressorId];

            if (tables.templates.items[suppressorId] === undefined) continue;
    
            tables.templates.items[suppressorId]._props.Ergonomics = suppressorSettings.Ergonomics;
            tables.templates.items[suppressorId]._props.Recoil = suppressorSettings.Recoil;
            tables.templates.items[suppressorId]._props.Accuracy = suppressorSettings.Accuracy;
            tables.templates.items[suppressorId]._props.Loudness = suppressorSettings.Loudness;
            tables.templates.items[suppressorId]._props.Velocity = suppressorSettings.Velocity;
            tables.templates.items[suppressorId]._props.HeatFactor = suppressorSettings.HeatFactor;
            tables.templates.items[suppressorId]._props.DurabilityBurnModificator = suppressorSettings.DurabilityBurnModificator;
            tables.templates.items[suppressorId]._props.CoolFactor = suppressorSettings.CoolFactor;
            tables.templates.prices[suppressorId] = suppressorSettings.fleaprice;
        }
        for (const stocksId in this.modConfig.Stocks) 
        {
            const stockSettings = this.modConfig.Stocks[stocksId];

            if (tables.templates.items[stocksId] === undefined) continue;
    
            tables.templates.items[stocksId]._props.Ergonomics = stockSettings.Ergonomics;
            tables.templates.items[stocksId]._props.Recoil = stockSettings.Recoil;  
            tables.templates.items[stocksId]._props.Accuracy = stockSettings.Accuracy;
            tables.templates.prices[stocksId] = stockSettings.fleaprice;
        }
        for (const armoredmaskId in this.modConfig.ArmoredMasksandHelmets) 
        {
            const armoredmasksSettings = this.modConfig.ArmoredMasksandHelmets[armoredmaskId];

            if (tables.templates.items[armoredmaskId] === undefined) continue;

            tables.templates.items[armoredmaskId]._props.armorClass = armoredmasksSettings.armorClass;
            tables.templates.items[armoredmaskId]._props.Durability = armoredmasksSettings.Durability;   
            tables.templates.items[armoredmaskId]._props.MaxDurability = armoredmasksSettings.MaxDurability;       
            tables.templates.items[armoredmaskId]._props.BlocksHeadwear = armoredmasksSettings.BlocksHeadwear;        
            tables.templates.items[armoredmaskId]._props.armorColliders = armoredmasksSettings.armorColliders; 
            tables.templates.prices[armoredmaskId] = armoredmasksSettings.fleaprice;
            
        }
        for (const itemID in this.modConfig.FleaBalance)
        {
            const fleabalanceSettings = this.modConfig.FleaBalance[itemID];

            if (tables.templates.items[itemID] === undefined) continue;

            tables.templates.prices[itemID] = fleabalanceSettings.fleaprice;
        }

    }
}

export const mod = new Mod();
