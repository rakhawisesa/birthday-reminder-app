const db = require("../models");
const CronJob = require("cron").CronJob;
const Users = db.users;
const Op = db.Sequelize.Op;
const axios = require("axios");

/* ================== API ROUTES ================================= */
exports.index = (req, res) => {
    res.json({
        message: "Welcome to the daily birthday reminder API"
    });
}

exports.create = async (req, res) => {
    if((Object.keys(req.body)).length < 5){
        res.status(400).send({
            message: 'Please provide 5 data to the API!'
        });
        return;
    }

    if(!req.body.first_name && !req.body.last_name &&
        !req.body.email && !req.body.birthday_date && !req.body.timezone_location){
            res.status(400).send({
                message: "Content can't be empty!"
            });
            return;
        }
    
    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        birthday_date: req.body.birthday_date,
        timezone_location: req.body.timezone_location
    };

    try{
        await Users.create(user);
        res.status(201).send({
            message: "Data created and saved on the database",
        });
    }catch(error){
        res.status(500).send({
            message: 'Error creating user',
            error: {
                error_name: error.name,
                error_code: error.parent.code,
                error_message: error.parent.sqlMessage
            }
        })
    }
}

exports.update = async (req, res) => {
    const id = req.params.id;

    if((Object.keys(req.body)).length === 0){
        res.status(400).send({
            message: 'Please provide data to the API'
        });
        return;
    }

    try{
        const numStatement = await Users.update(req.body, {
            where: {id : id}
        });
    
        if(numStatement == 1){
            res.send({
                message: 'user was updated successfully'
            })
        }else{
            res.send({
                message: `Cannot update user with id = ${id}, maybe user with id = ${id} is not found`
            })
        }
    }catch(error){
        res.status(500).send({
            message: `Error updating user with id = ${id}`,
            error: {
                error_name: error.name,
                error_code: error.parent.code,
                error_message: error.parent.sqlMessage
            }
        });
    }
}

exports.delete = async (req, res) => {
    const id = req.params.id;

    try{
        const numStatement = await Users.destroy({
            where: {id: id}
        });

        if(numStatement == 1){
            res.send({
                message: "User was deleted successfully!"
            });
        }else{
            res.send({
                message: `Cannot delete user with id = ${id}. Maybe user with id = ${id} not found!`
            })
        }
    }catch(error){
        res.status(500).send({
            message: `Could not delete User with id = ${id}`,
            error: {
                error_name: error.name,
                error_code: error.parent.code,
                error_message: error.parent.sqlMessage
            }
        });
    }
}


/* ======================== CRON JOB =========================== */
let timezoneCron = [
    'Europe/Andorra',
    'Asia/Dubai',
    'Asia/Kabul',
    'Europe/Tirane',
    'Asia/Yerevan',
    'Antarctica/Casey',
    'Antarctica/Davis',
    'Antarctica/Mawson',
    'Antarctica/Palmer',
    'Antarctica/Rothera',
    'Antarctica/Syowa',
    'Antarctica/Troll',
    'Antarctica/Vostok',
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Cordoba',
    'America/Argentina/Salta',
    'America/Argentina/Jujuy',
    'America/Argentina/Tucuman',
    'America/Argentina/Catamarca',
    'America/Argentina/La_Rioja',
    'America/Argentina/San_Juan',
    'America/Argentina/Mendoza',
    'America/Argentina/San_Luis',
    'America/Argentina/Rio_Gallegos',
    'America/Argentina/Ushuaia',
    'Pacific/Pago_Pago',
    'Europe/Vienna',
    'Australia/Lord_Howe',
    'Antarctica/Macquarie',
    'Australia/Hobart',
    'Australia/Currie',
    'Australia/Melbourne',
    'Australia/Sydney',
    'Australia/Broken_Hill',
    'Australia/Brisbane',
    'Australia/Lindeman',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Australia/Perth',
    'Australia/Eucla',
    'Asia/Baku',
    'America/Barbados',
    'Asia/Dhaka',
    'Europe/Brussels',
    'Europe/Sofia',
    'Atlantic/Bermuda',
    'Asia/Brunei',
    'America/La_Paz',
    'America/Noronha',
    'America/Belem',
    'America/Fortaleza',
    'America/Recife',
    'America/Araguaina',
    'America/Maceio',
    'America/Bahia',
    'America/Sao_Paulo',
    'America/Campo_Grande',
    'America/Cuiaba',
    'America/Santarem',
    'America/Porto_Velho',
    'America/Boa_Vista',
    'America/Manaus',
    'America/Eirunepe',
    'America/Rio_Branco',
    'America/Nassau',
    'Asia/Thimphu',
    'Europe/Minsk',
    'America/Belize',
    'America/St_Johns',
    'America/Halifax',
    'America/Glace_Bay',
    'America/Moncton',
    'America/Goose_Bay',
    'America/Blanc-Sablon',
    'America/Toronto',
    'America/Nipigon',
    'America/Thunder_Bay',
    'America/Iqaluit',
    'America/Pangnirtung',
    'America/Atikokan',
    'America/Winnipeg',
    'America/Rainy_River',
    'America/Resolute',
    'America/Rankin_Inlet',
    'America/Regina',
    'America/Swift_Current',
    'America/Edmonton',
    'America/Cambridge_Bay',
    'America/Yellowknife',
    'America/Inuvik',
    'America/Creston',
    'America/Dawson_Creek',
    'America/Fort_Nelson',
    'America/Vancouver',
    'America/Whitehorse',
    'America/Dawson',
    'Indian/Cocos',
    'Europe/Zurich',
    'Africa/Abidjan',
    'Pacific/Rarotonga',
    'America/Santiago',
    'America/Punta_Arenas',
    'Pacific/Easter',
    'Asia/Shanghai',
    'Asia/Urumqi',
    'America/Bogota',
    'America/Costa_Rica',
    'America/Havana',
    'Atlantic/Cape_Verde',
    'America/Curacao',
    'Indian/Christmas',
    'Asia/Nicosia',
    'Asia/Famagusta',
    'Europe/Prague',
    'Europe/Berlin',
    'Europe/Copenhagen',
    'America/Santo_Domingo',
    'Africa/Algiers',
    'America/Guayaquil',
    'Pacific/Galapagos',
    'Europe/Tallinn',
    'Africa/Cairo',
    'Africa/El_Aaiun',
    'Europe/Madrid',
    'Africa/Ceuta',
    'Atlantic/Canary',
    'Europe/Helsinki',
    'Pacific/Fiji',
    'Atlantic/Stanley',
    'Pacific/Chuuk',
    'Pacific/Pohnpei',
    'Pacific/Kosrae',
    'Atlantic/Faroe',
    'Europe/Paris',
    'Europe/London',
    'Asia/Tbilisi',
    'America/Cayenne',
    'Africa/Accra',
    'Europe/Gibraltar',
    'America/Godthab',
    'America/Danmarkshavn',
    'America/Scoresbysund',
    'America/Thule',
    'Europe/Athens',
    'Atlantic/South_Georgia',
    'America/Guatemala',
    'Pacific/Guam',
    'Africa/Bissau',
    'America/Guyana',
    'Asia/Hong_Kong',
    'America/Tegucigalpa',
    'America/Port-au-Prince',
    'Europe/Budapest',
    'Asia/Jakarta',
    'Asia/Pontianak',
    'Asia/Makassar',
    'Asia/Jayapura',
    'Europe/Dublin',
    'Asia/Jerusalem',
    'Asia/Kolkata',
    'Indian/Chagos',
    'Asia/Baghdad',
    'Asia/Tehran',
    'Atlantic/Reykjavik',
    'Europe/Rome',
    'America/Jamaica',
    'Asia/Amman',
    'Asia/Tokyo',
    'Africa/Nairobi',
    'Asia/Bishkek',
    'Pacific/Tarawa',
    'Pacific/Enderbury',
    'Pacific/Kiritimati',
    'Asia/Pyongyang',
    'Asia/Seoul',
    'Asia/Almaty',
    'Asia/Qyzylorda',
    'Asia/Aqtobe',
    'Asia/Aqtau',
    'Asia/Atyrau',
    'Asia/Oral',
    'Asia/Beirut',
    'Asia/Colombo',
    'Africa/Monrovia',
    'Europe/Vilnius',
    'Europe/Luxembourg',
    'Europe/Riga',
    'Africa/Tripoli',
    'Africa/Casablanca',
    'Europe/Monaco',
    'Europe/Chisinau',
    'Pacific/Majuro',
    'Pacific/Kwajalein',
    'Asia/Yangon',
    'Asia/Ulaanbaatar',
    'Asia/Hovd',
    'Asia/Choibalsan',
    'Asia/Macau',
    'America/Martinique',
    'Europe/Malta',
    'Indian/Mauritius',
    'Indian/Maldives',
    'America/Mexico_City',
    'America/Cancun',
    'America/Merida',
    'America/Monterrey',
    'America/Matamoros',
    'America/Mazatlan',
    'America/Chihuahua',
    'America/Ojinaga',
    'America/Hermosillo',
    'America/Tijuana',
    'America/Bahia_Banderas',
    'Asia/Kuala_Lumpur',
    'Asia/Kuching',
    'Africa/Maputo',
    'Africa/Windhoek',
    'Pacific/Noumea',
    'Pacific/Norfolk',
    'Africa/Lagos',
    'America/Managua',
    'Europe/Amsterdam',
    'Europe/Oslo',
    'Asia/Kathmandu',
    'Pacific/Nauru',
    'Pacific/Niue',
    'Pacific/Auckland',
    'Pacific/Chatham',
    'America/Panama',
    'America/Lima',
    'Pacific/Tahiti',
    'Pacific/Marquesas',
    'Pacific/Gambier',
    'Pacific/Port_Moresby',
    'Pacific/Bougainville',
    'Asia/Manila',
    'Asia/Karachi',
    'Europe/Warsaw',
    'America/Miquelon',
    'Pacific/Pitcairn',
    'America/Puerto_Rico',
    'Asia/Gaza',
    'Asia/Hebron',
    'Europe/Lisbon',
    'Atlantic/Madeira',
    'Atlantic/Azores',
    'Pacific/Palau',
    'America/Asuncion',
    'Asia/Qatar',
    'Indian/Reunion',
    'Europe/Bucharest',
    'Europe/Belgrade',
    'Europe/Kaliningrad',
    'Europe/Moscow',
    'Europe/Simferopol',
    'Europe/Kirov',
    'Europe/Astrakhan',
    'Europe/Volgograd',
    'Europe/Saratov',
    'Europe/Ulyanovsk',
    'Europe/Samara',
    'Asia/Yekaterinburg',
    'Asia/Omsk',
    'Asia/Novosibirsk',
    'Asia/Barnaul',
    'Asia/Tomsk',
    'Asia/Novokuznetsk',
    'Asia/Krasnoyarsk',
    'Asia/Irkutsk',
    'Asia/Chita',
    'Asia/Yakutsk',
    'Asia/Khandyga',
    'Asia/Vladivostok',
    'Asia/Ust-Nera',
    'Asia/Magadan',
    'Asia/Sakhalin',
    'Asia/Srednekolymsk',
    'Asia/Kamchatka',
    'Asia/Anadyr',
    'Asia/Riyadh',
    'Pacific/Guadalcanal',
    'Indian/Mahe',
    'Africa/Khartoum',
    'Europe/Stockholm',
    'Asia/Singapore',
    'America/Paramaribo',
    'Africa/Juba',
    'Africa/Sao_Tome',
    'America/El_Salvador',
    'Asia/Damascus',
    'America/Grand_Turk',
    'Africa/Ndjamena',
    'Indian/Kerguelen',
    'Asia/Bangkok',
    'Asia/Dushanbe',
    'Pacific/Fakaofo',
    'Asia/Dili',
    'Asia/Ashgabat',
    'Africa/Tunis',
    'Pacific/Tongatapu',
    'Europe/Istanbul',
    'America/Port_of_Spain',
    'Pacific/Funafuti',
    'Asia/Taipei',
    'Europe/Kiev',
    'Europe/Uzhgorod',
    'Europe/Zaporozhye',
    'Pacific/Wake',
    'America/New_York',
    'America/Detroit',
    'America/Kentucky/Louisville',
    'America/Kentucky/Monticello',
    'America/Indiana/Indianapolis',
    'America/Indiana/Vincennes',
    'America/Indiana/Winamac',
    'America/Indiana/Marengo',
    'America/Indiana/Petersburg',
    'America/Indiana/Vevay',
    'America/Chicago',
    'America/Indiana/Tell_City',
    'America/Indiana/Knox',
    'America/Menominee',
    'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem',
    'America/North_Dakota/Beulah',
    'America/Denver',
    'America/Boise',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Juneau',
    'America/Sitka',
    'America/Metlakatla',
    'America/Yakutat',
    'America/Nome',
    'America/Adak',
    'Pacific/Honolulu',
    'America/Montevideo',
    'Asia/Samarkand',
    'Asia/Tashkent',
    'America/Caracas',
    'Asia/Ho_Chi_Minh',
    'Pacific/Efate',
    'Pacific/Wallis',
    'Pacific/Apia',
    'Africa/Johannesburg'
]

/* ------ Birthday Cron Job -------*/
timezoneCron.forEach(timezone => {
    new CronJob('00 00 09 * * *', async () => {
        const timezoneArray = timezone.split("/");
        let detailTimezone = null;
        if(timezoneArray.length > 2){
            detailTimezone = timezoneArray[2].toLowerCase();
        }else{
            detailTimezone = timezoneArray[1].toLowerCase();
        }

        if(detailTimezone.includes("_")){
            const splitUnderscoreArr = detailTimezone.split("_");
            let itemWithoutUnderscore = "";
            splitUnderscoreArr.forEach((item) => {
                itemWithoutUnderscore += item
                itemWithoutUnderscore += " ";
            });
            itemWithoutUnderscore.replace(/^\s+/g, '');
            detailTimezone = itemWithoutUnderscore.toLowerCase();
        }

        detailTimezone.replace(/^\s+/g, '');

        try{
            const condition = {
                timezone_location: {
                    [Op.eq]: detailTimezone
                },
                is_sent: {
                    [Op.eq]: parseInt(0)
                }
            }
            const userWithSpecifiedTimezone = await Users.findAll({where : condition});
            userWithSpecifiedTimezone.forEach(async (item) => {
                // Processing id from database
                const id = item.dataValues.id;

                // Processing first_name & last_name from database
                const firstName = item.dataValues.first_name;
                const lastName = item.dataValues.last_name;

                // Processing email from database
                const email = item.dataValues.email;

                // Processing birthday_date from database
                const birthdayData = item.dataValues.birthday_date;
                const birthdayArray = birthdayData.split("-");
                const birthdayDate = parseInt(birthdayArray[2]);
                const birthdayMonth = parseInt(birthdayArray[1]);

                // Get current date
                const getDate = new Date();
                const currentDate = getDate.getDate();
                const currentMonth = getDate.getMonth() + 1;

                // if birthday_date is equal to current date, then call the API
                if(birthdayDate == currentDate && birthdayMonth == currentMonth){
                    try{
                        const resultEmailAPI = await axios.post('https://email-service.digitalenvision.com.au/send-email', {
                            "email": email,
                            "message": `Hey, ${firstName} ${lastName}, it's your birthday. Happy birthday!`
                        });

                        console.log("======== cron job =========")
                        console.log(`Result ${email}, fullname : ${firstName} ${lastName} :`);
                        console.log(resultEmailAPI.data);
                        
                        console.log("======== cron job - update database =======")
                        try{
                            const numStatement = await Users.update({
                                'is_sent': 1
                            }, {
                                where: {id : id}
                            });
    
                            if(numStatement == 1){
                                console.log(`Data ${email} updated`);
                            }else{
                                console.log(`Cannot update user with id = ${id}, please check on the birthday cron job!`);
                            }
                        }catch(error){
                            console.log("error database : ");
                            console.log(`{
                                error_name: ${error.name},
                                error_code: error.parent.code,
                                error_message: error.parent.sqlMessage
                            }`);
                        }
                    }catch(error){
                        console.log("error : ");
                        console.log(error.response.status);
                        console.log(error.response.statusText)
                    }
                }
            })
        }catch(error){
            console.log(error);
        }
    }, null, true, timezone)
});


/* --------- Backup Birthday Cron Job (current date - 1 day) every 30 minute ---------- */
timezoneCron.forEach(timezone => {
    new CronJob('* */30 * * * *', async () => {
        const timezoneArray = timezone.split("/");
        let detailTimezone = null;
        if(timezoneArray.length > 2){
            detailTimezone = timezoneArray[2].toLowerCase();
        }else{
            detailTimezone = timezoneArray[1].toLowerCase();
        }

        if(detailTimezone.includes("_")){
            const splitUnderscoreArr = detailTimezone.split("_");
            let itemWithoutUnderscore = "";
            splitUnderscoreArr.forEach((item) => {
                itemWithoutUnderscore += item
                itemWithoutUnderscore += " ";
            });
            itemWithoutUnderscore.replace(/^\s+/g, '');
            detailTimezone = itemWithoutUnderscore.toLowerCase();
        }

        detailTimezone.replace(/^\s+/g, '');
        
        try{
            const condition = {
                timezone_location: {
                    [Op.eq]: detailTimezone
                },
                is_sent: {
                    [Op.eq]: parseInt(0)
                }
            }
            const userWithSpecifiedTimezone = await Users.findAll({where : condition});
            userWithSpecifiedTimezone.forEach(async (item) => {
                // Processing id from database
                const id = item.dataValues.id;

                // Processing first_name & last_name from database
                const firstName = item.dataValues.first_name;
                const lastName = item.dataValues.last_name;

                // Processing email from database
                const email = item.dataValues.email;

                // Processing birthday_date from database
                const birthdayData = item.dataValues.birthday_date;
                const birthdayArray = birthdayData.split("-");
                const birthdayDate = parseInt(birthdayArray[2]);
                const birthdayMonth = parseInt(birthdayArray[1]);

                // Get current date
                const getDate = new Date();
                const yesterdayDate = getDate.getDate() - 1;
                console.log(`Yesterday birthday date : ${birthdayDate}`);
                console.log(`Yesterday : ${yesterdayDate}`);
                const currentMonth = getDate.getMonth() + 1;

                // if birthday_date is equal to current date, then call the API
                if(birthdayDate == yesterdayDate && birthdayMonth == currentMonth){
                    try{
                        const resultEmailAPI = await axios.post('https://email-service.digitalenvision.com.au/send-email', {
                            "email": email,
                            "message": `Hey, ${firstName} ${lastName}, yesterday is your birthday. Happy birthday!`
                        });

                        console.log("======== cron job =========")
                        console.log(`Result ${email}, fullname : ${firstName} ${lastName} :`);
                        console.log(resultEmailAPI.data);
                        
                        console.log("======== cron job - update database =======")
                        try{
                            const numStatement = await Users.update({
                                'is_sent': 1
                            }, {
                                where: {id : id}
                            });
    
                            if(numStatement == 1){
                                console.log(`Data ${email} updated`);
                            }else{
                                console.log(`Cannot update user with id = ${id}, please check on the backup birthday cron job!`);
                            }
                        }catch(error){
                            console.log("error database : ");
                            console.log(`{
                                error_name: ${error.name},
                                error_code: error.parent.code,
                                error_message: error.parent.sqlMessage
                            }`);
                        }
                    }catch(error){
                        console.log("error : ");
                        console.log(error.response.status);
                        console.log(error.response.statusText)
                    }
                }
            })
        }catch(error){
            console.log(error);
        }
    }, null, true, timezone)
});

/* --------- reset is_sent Cron Job (change is_sent from 1 to 0) ------------- */
timezoneCron.forEach(timezone => {
    new CronJob('00 00 00 01 01 *', async () => {
        const timezoneArray = timezone.split("/");
        let detailTimezone = null;
        if(timezoneArray.length > 2){
            detailTimezone = timezoneArray[2].toLowerCase();
        }else{
            detailTimezone = timezoneArray[1].toLowerCase();
        }

        if(detailTimezone.includes("_")){
            const splitUnderscoreArr = detailTimezone.split("_");
            let itemWithoutUnderscore = "";
            splitUnderscoreArr.forEach((item) => {
                itemWithoutUnderscore += item
                itemWithoutUnderscore += " ";
            });
            itemWithoutUnderscore.replace(/^\s+/g, '');
            detailTimezone = itemWithoutUnderscore.toLowerCase();
        }

        detailTimezone.replace(/^\s+/g, '');

        try{
            const condition = {
                timezone_location: {
                    [Op.eq]: detailTimezone
                }
            }
            const userWithSpecifiedTimezone = await Users.findAll({where : condition}); 
            userWithSpecifiedTimezone.forEach(async (item) => {
                // Processing id from database
                const id = item.dataValues.id;

                // Processing email from database
                const email = item.dataValues.email;
    
                try{
                    const numStatement = await Users.update({
                        'is_sent': 0
                    }, {
                        where: {id : id}
                    });

                    if(numStatement == 1){
                        console.log(`Data ${email} updated`);
                    }else{
                        console.log(`Cannot update user with id = ${id}, please check on the reset is_sent cron job!`);
                    }
                }catch(error){
                    console.log("error database : ");
                    console.log(`{
                        error_name: ${error.name},
                        error_code: error.parent.code,
                        error_message: error.parent.sqlMessage
                    }`);
                }
            })
        }catch(error){
            console.log(error);
        }
    }, null, true, timezone);
})