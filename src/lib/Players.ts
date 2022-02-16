import { URL } from 'node:url';
import { Player } from './Player';
import * as HTTP from './APIRequest';

export class Players extends Array<Player> {
    /**
     * 
     * @param {string} rawData Data returned from the API as string.
     * 
     * Providing no parameter creates an empty list of teams with default options
     */
    constructor(rawData?: string) {
        super();
        if (!rawData) {
            this.Count = 0;
        }
        else {
            let parsedData: any = JSON.parse(rawData);
            this.Count = parsedData.count;
            for (let player of parsedData.data) {
                this.push(new Player(player));
            }
        }
        this.Options = new Players.Options();
    }

    /**
     * Number of teams returned from the API
     */
    public Count: number;

    /**
     * Options for non-static requests.
     * 
     * Will always have default values upon creation of a new Teams-object.
     */
    public Options: Players.Options;

    /**
     * Sends a request to the API asynchronously with parameters taken of local Options and updates the local object
     */
    public async Get(): Promise<void> {
        let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/teams/category/${this.Options.Category.toString()}`);
        uri.searchParams.append('order', this.Options.Order.toString());
        uri.searchParams.append('country', this.Options.Country.toString());
        uri.searchParams.append('search', this.Options.Search.toString());
        while (this.length) {
            this.pop();
        }
        let result: Players = new Players(await HTTP.get(uri));
        this.Count = result.Count;
        for (let item of result) {
            this.push(item);
        }
    }

    /**
     * Sends a request to the API asynchronously with the given parameters and returns the result as a new Teams object
     * @param {Players.Options | Category | string | any} options
     * 
     * Examples:
     * ```js
     * let result = await Players.Get();
     * let result = await Players.Get('200cc');
     * let result = await Players.Get(Players.Options.Category.SHADOW);
     * let result = await Players.Get(new Players.Options());
     * let result = await Players.Get(new Players.Options({
     *     Order: Order.REGISTRATION_TEAM_ASC,
     *     Country: Country.Unknown
     * }));
     * ```
     */
    public static async Get(options?: Players.Options | Players.Options.Category | string | any): Promise<Players> {
        let o: Players.Options = new Players.Options();
        if (!options) { } // keep this to avoid null-reference-errors
        else if (Players.Options.Category instanceof options) {
            o.Category = options;
        }
        else if (Players.Options instanceof options) {
            o = options;
        }
        else if (typeof options == 'string') {
            let category: Players.Options.Category = (<any>Players.Options.Category)[options];
            if (!category) {
                category = Players.Options.Category.ALL;
            }
            o.Category = category;
        }
        let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/players/category/${o.Category.toString()}`);
        uri.searchParams.append('order', o.Order.toString());
        uri.searchParams.append('language', o.Country.toString());
        uri.searchParams.append('search', o.Search.toString());
        let result: Players = new Players(await HTTP.get(uri));
        result.Options = o;
        return result;
    }
}

export namespace Players {
    export class Options {
        public constructor(options?: Options | { Category?: Options.Category, Country?: Options.Country, Order?: Options.Order, Search?: string }) {
            this.Category = options ? (options.Category ? options.Category : Options.Category.ALL) : Options.Category.ALL;
            this.Country = options ? (options.Country ? options.Country : Options.Country.ALL) : Options.Country.ALL;
            this.Order = options ? (options.Order ? options.Order : Options.Order.NAME_ASC) : Options.Order.NAME_ASC;
            this.Search = options ? (options.Search ? options.Search : '') : '';
        }

        public Category: Options.Category;

        public Country: Options.Country;

        public Order: Options.Order;

        public Search: string;
    }

    export namespace Options {
        /**
         * Categories for players appended to .../registry/players/category/
         * 
         * Default: .../registry/players/category/150cc
         */
        export enum Category {
            /**
             * All Players
             */
            ALL = 'all',
            /**
             * All Players in MK8DX 150cc Team
             */
            '150CC' = '150cc',
            /**
             * All Players in MK8DX 200cc Team
             */
            '200CC' = '200cc',
            /**
             * All Players in MKTour VS Race Team
             */
            MKTOUR = 'mktour_vs',
            /**
             * All Players in no Team
             */
            SHADOW = 'shadow'
        }

        /**
         * Countries to filter players as parameter
         * 
         * Default: country=ZZ
         */
        export enum Country {
            /**
             * Every available language
             */
            ALL = 'ZZ',
            Afghanistan = 'AF',
            Albania = 'AL',
            Algeria = 'DZ',
            AmericanSamoa = 'AS',
            Andorra = 'AD',
            Antarctica = 'AQ',
            Argentina = 'AR',
            Armenia = 'AM',
            Aruba = 'AW',
            Australia = 'AU',
            Austria = 'AT',
            Azerbaijan = 'AZ',
            Bahamas = 'BS',
            Bahrain = 'BH',
            Bangladesh = 'BD',
            Barbados = 'BB',
            Belarus = 'BY',
            Belgium = 'BE',
            Bolivia = 'BO',
            BonaireSintEustatiusAndSaba = 'BQ',
            BosniaAndHerzegovina = 'BA',
            Brazil = 'BR',
            BritishIndianOceanTerritory = 'IO',
            Canada = 'CA',
            Chile = 'CL',
            China = 'CN',
            Colombia = 'CO',
            Congo = 'CG',
            CostaRica = 'CR',
            Croatia = 'HR',
            Cuba = 'CU',
            Cyprus = 'CY',
            CzechRepublic = 'CZ',
            Denmark = 'DK',
            DominicanRepublic = 'DO',
            Ecuador = 'EC',
            Egypt = 'EG',
            ElSalvador = 'SV',
            Estonia = 'EE',
            Finland = 'FI',
            France = 'FR',
            FrenchPolynesia = 'PF',
            Georgia = 'GE',
            Germany = 'DE',
            Greece = 'GR',
            Guam = 'GU',
            Guatemala = 'GT',
            Honduras = 'HN',
            HongKong = 'HK',
            Hungary = 'HU',
            Iceland = 'IS',
            India = 'IN',
            Indonesia = 'ID',
            Ireland = 'IE',
            Israel = 'IL',
            Italy = 'IT',
            Jamaica = 'JM',
            Japan = 'JP',
            Jersey = 'JE',
            Jordan = 'JO',
            Kenya = 'KE',
            Latvia = 'LV',
            Lebanon = 'LB',
            Luxembourg = 'LU',
            Macao = 'MO',
            Madagascar = 'MG',
            Malaysia = 'MY',
            Malta = 'MT',
            Mexico = 'MX',
            Morocco = 'MA',
            Netherlands = 'NL',
            NewCaledonia = 'NC',
            NewZealand = 'NZ',
            Nicaragua = 'NI',
            Niger = 'NE',
            Norway = 'NO',
            Panama = 'PA',
            Paraguay = 'PY',
            Peru = 'PE',
            Philippines = 'PH',
            Poland = 'PL',
            Portugal = 'PT',
            PuertoRico = 'PR',
            Romania = 'RO',
            Russia = 'RU',
            Reunion = 'RE',
            SaudiArabia = 'SA',
            SierraLeone = 'LS',
            Singapore = 'SG',
            Slovakia = 'SK',
            Slovenia = 'SI',
            SouthAfrica = 'ZA',
            SouthGeorgiaAndTheSouthSandwichIslands = 'GS',
            SouthKorea = 'KR',
            Spain = 'ES',
            SriLanka = 'LK',
            Sudan = 'SD',
            Sweden = 'SE',
            Switzerland = 'CH',
            Taiwan = 'TW',
            Thailand = 'TH',
            TrinidadAndTobago = 'TT',
            Tunisia = 'TN',
            Turkey = 'TR',
            USVirginIslands = 'VI',
            Ukraine = 'UA',
            UnitedArabEmirates = 'AE',
            UnitedKingdom = 'GB',
            UnitedStates = 'US',
            /**
             * Every unknown language
             */
            Unknown = 'XX',
            Uruguay = 'UY',
            Venezuela = 'VE',
            Zimbabwe = 'ZW'
        }

        /**
         * Sort parameter for player queries
         * 
         * Default: order=NA
         */
        export enum Order {
            /**
             * DEFAULT
             * 
             * Order by name ascending.
             * 
             * Valid in every category.
             */
            NAME_ASC = 'NA',
            /**
             * Order by name descending.
             * 
             * Valid in every category.
             */
            NAME_DESC = 'ND',
            /**
             * Order by friendcode ascending.
             * 
             * Uses the `custom_field`, which is the FC of the corresponding game to the category.
             */
            FC_ASC = 'FA',
            /**
             * Order by friendcode descending.
             * 
             * Uses the `custom_field`, which is the FC of the corresponding game to the category.
             */
            FC_DESC = 'FD',
            /**
             * Order by switch friendcode ascending.
             * 
             * Valid categories: all, shadow
             */
            // FC_SWITCH_ASC = 'SFA',
            /**
             * Order by switch friendcode descending.
             * 
             * Valid categories: all, shadow
             */
            // FC_SWITCH_DESC = 'SFD',
            /**
             * Order by mktour friendcode ascending.
             * 
             * Valid categories: all, shadow
             */
            // FC_TOUR_ASC = 'TFA',
            /**
             * Order by mktour friendcode descending.
             * 
             * Valid categories: all, shadow
             */
            // FC_TOUR_DESC = 'TFD',
            /**
             * Order by 3DS friendcode ascending.
             * 
             * Valid categories: all, shadow
             */
            // FC_3DS_ASC = '3FA',
            /**
             * Order by 3DS friendcode descending.
             * 
             * Valid categories: all, shadow
             */
            // FC_3DS_DESC = '3FD',
            /**
             * Order by NNID ascending.
             * 
             * Valid categories: all, shadow
             */
            // FC_NNID_ASC = 'UFA',
            /**
             * Order by NNID descending.
             * 
             * Valid categories: all, shadow
             */
            // FC_NNID_DESC = 'UFD',
            /**
             * Order by latest team registration.
             * 
             * Valid categories: 150cc, 200cc, mktour
             */
            REGISTRATION_TEAM_ASC = 'TA',
            /**
             * Order by latest team registration.
             * 
             * Valid categories: 150cc, 200cc, mktour
             */
            REGISTRATION_TEAM_DESC = 'TD',
            /**
             * Order by player registration date ascending.
             * 
             * Valid in every category.
             */
            REGISTRATION_PLAYER_ASC = 'RA',
            /**
             * Order by player registration date descending.
             * 
             * Valid in every category.
             */
            REGISTRATION_PLAYER_DESC = 'RD',
        }
    }
}
