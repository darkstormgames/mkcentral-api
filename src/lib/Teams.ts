import { URL } from 'node:url';
import { Team } from './Team';
import * as HTTP from './APIRequest';

export class Teams extends Array<Team> {
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
            for (let team of parsedData.data) {
                this.push(new Team(team));
            }
        }
        this.Options = new Teams.Options();
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
    public Options: Teams.Options;

    /**
     * Sends a request to the API asynchronously with parameters taken of local Options and updates the local object
     */
    public async Get(): Promise<void> {
        let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/teams/category/${this.Options.Category.toString()}`);
        uri.searchParams.append('order', this.Options.Order.toString());
        uri.searchParams.append('language', this.Options.Language.toString());
        uri.searchParams.append('search', this.Options.Search.toString());
        while (this.length) {
            this.pop();
        }
        let result: Teams = new Teams(await HTTP.get(uri));
        this.Count = result.Count;
        for (let item of result) {
            this.push(item);
        }
    }

    /**
     * Sends a request to the API asynchronously with the given parameters and returns the result as a new Teams object
     * @param {TeamFilter | Category | string | any} options
     * 
     * Examples:
     * ```js
     * let result = await Teams.Get();
     * let result = await Teams.Get('200cc');
     * let result = await Teams.Get(Teams.Options.Category.HISTORICAL);
     * let result = await Teams.Get(new Teams.Options());
     * let result = await Teams.Get(new Teams.Options({
     *     Order: Order.REGISTRATION_ASC,
     *     Language: Language.OTHER
     * }));
     * ```
     */
    public static async Get(options?: Teams.Options | Teams.Options.Category | string | any): Promise<Teams> {
        let o: Teams.Options = new Teams.Options();
        if (!options) { } // keep this to avoid null-reference-errors
        else if (Teams.Options.Category instanceof options) {
            o.Category = options;
        }
        else if (Teams.Options instanceof options) {
            o = options;
        }
        else if (typeof options == 'string') {
            let category: Teams.Options.Category = (<any>Teams.Options.Category)[options];
            if (!category) {
                category = Teams.Options.Category.ACTIVE;
            }
            o.Category = category;
        }
        let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/teams/category/${o.Category.toString()}`);
        uri.searchParams.append('order', o.Order.toString());
        uri.searchParams.append('language', o.Language.toString());
        uri.searchParams.append('search', o.Search.toString());
        let result: Teams = new Teams(await HTTP.get(uri));
        result.Options = o;
        return result;
    }
}

export namespace Teams {
    export class Options {
        public constructor(options?: Options | { Category?: Options.Category, Language?: Options.Language, Order?: Options.Order, Search?: string }) {
            this.Category = options ? (options.Category ? options.Category : Options.Category.ACTIVE) : Options.Category.ACTIVE;
            this.Language = options ? (options.Language ? options.Language : Options.Language.ALL) : Options.Language.ALL;
            this.Order = options ? (options.Order ? options.Order : Options.Order.NAME_ASC) : Options.Order.NAME_ASC;
            this.Search = options ? (options.Search ? options.Search : '') : '';
        }

        public Category: Options.Category;

        public Language: Options.Language;

        public Order: Options.Order;

        public Search: string;
    }

    export namespace Options {
        /**
             * Categories for teams appended to .../registry/teams/category/
             * 
             * Default: .../registry/teams/category/active
             */
        export enum Category {
            /**
             * All Active Teams
             */
            ALL = 'active',
            /**
             * All Active Teams
             */
            ACTIVE = 'active',
            /**
             * All Active 150cc Teams
             */
            '150CC' = '150cc',
            /**
             * All Active 200cc Teams
             */
            '200CC' = '200cc',
            /**
             * All Active MK Tour Teams
             */
            MKTOUR = 'mktour_vs',
            /**
             * All Inactive/Old Teams
             */
            HISTORICAL = 'historical'
        }

        /**
         * Languages to filter teams as parameter
         * 
         * Default: language=all
         */
        export enum Language {
            /**
             * Every available language
             */
            ALL = 'all',
            /**
             * English teams only
             */
            ENGLISH = 'English',
            /**
             * French teams only
             */
            FRENCH = 'French',
            /**
             * German teams only
             */
            GERMAN = 'German',
            /**
             * Portuguese teams only
             */
            PORTUGUESE = 'Portuguese',
            /**
             * Spanish teams only
             */
            SPANISH = 'Spanish',
            /**
             * Teams without default language
             */
            OTHER = 'other'
        }

        /**
         * Sort parameter for team queries
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
             * Order by latest team registration.
             * 
             * Valid categories: 150cc, 200cc, mktour
             */
            REGISTRATION_ASC = 'RA',
            /**
             * Order by latest team registration.
             * 
             * Valid categories: 150cc, 200cc, mktour
             */
            REGISTRATION_DESC = 'RD',
            /**
             * Order by player registration date ascending.
             * 
             * Valid in every category.
             */
            STATUS_ASC = 'SA',
            /**
             * Order by player registration date descending.
             * 
             * Valid in every category.
             */
            STATUS_DESC = 'SD',
        }
    }
}
