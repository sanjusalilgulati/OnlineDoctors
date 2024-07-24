'use strict';

var FORMS = {
    ACNE: {
        QUESTIONS: {
            acne_begin : {
                question : "At what age did your acne start?",
                options : [
                    'below 18', 
                    '18-26',
                    'Above 26'
                ]
            },
            acne_product_result : {
                question : "Are you using any product?",
                options : [
                    "Yes",
                    "No"
                ]   
            },
            acne_accutane : {
                question : "Have you ever used Accutane?  If so, what were the results and are you still using it?",
                options  : [
                    'No',
                    'yes',
                    'Yes, not using right now'
                ]
            },
            acne_acne_cause : 
            {  
                question : "Does your acne cause pitting or scars?",
                options  : [
                    'Yes',
                    'No'
                ]
            },    
            acne_hormonal_agents : {
                question : "Are you using any hormonal agents?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            acne_allergies_status : {
                question : "Do you have any known allergies?",
                options  : [
                    'Yes',
                    'No'
                ]
            }
        }
    },
    BLADDER: {
        QUESTIONS:{
            bladder_past : {
                question : "How long have you had trouble with urination?",
                options  : [
                    'Last 1 or 2 days',
                    'More Than 3 days'
                ]
            },    
            bladder_symptom: {
                question : "Please mark your most problematic symptoms",
                options  : [
                    'Stomach ache',
                    'Pain While passing urine',
                    'Others'
                ],
            },    
            bladder_used_cather_: {
                question : "Have you ever had to use a catheter to urinate?",
                options  : [
                    'Yes',
                    'No'
                ]
            },    
            bladder_diapers: {
                question : "Have you had to use diapers for urination difficulties?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            bladder_cystoscopy: {
                question : "Have you ever had a cystoscopy?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            bladder_genitourinary_history: {
                question : "Do you have any prior history of genitourinary cancers?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            bladder_cancer_list: {
                question : "Please list any cancers you have had:",
                options  : [
                    'Bladder Cancer',
                    'Kidney (Renal Cell) Cancer',
                    'Penile Cancer',
                    'Prostate Cancer',
                    'Renal Pelvis and Urethral Cancer',
                    'Testicular Cancer',
                    'Urothelial Cancer',
                    'Wilms Tumor',
                    'Others'
                ]
            },
            bladder_infection_history: {
                question : "Do you have a history of kidney or bladder infections?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            bladder_stone_history: {
               question :  "Do you have a history of kidney stones?",
               options  : [
                    'Yes',
                    'No'
               ]
            },
            bladder_genital_exam: {
                question : "Have you had a genital exam with a healthcare provider in the past five years?",
                options  : [
                    'Yes',
                    'No'
                ]
            }      
        }
    },
    COLD: {
        QUESTIONS:{
            coldSores_begin : {
                question : "When did you first start getting them?",
                options  : [
                    'Last 1 or 2 days',
                    'More Than 3 days'
                ]
            },
            coldSores_times : {
                question : "How many times have you had cold sore outbreaks in the past year?",
                options  : [
                    'Less than one time',
                    'In between 2 to 5',
                    'More than 5'
                ]
            },
            coldSores_duration : {
                question : "If you get a cold sore how long does it usually last?",
                options  : [
                    'One Day',
                    'Two Day',
                    'More than 3 Day'
                ]
            },
            coldSores_have : {
                question : "Have you had a cold sore before?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            coldSores_symptoms : {
                question : "Have you had any of the following symptoms associated with your cold sore?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            coldSores_drugs : {
                question : "Do you take any of the following recreational drugs?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            coldSores_medication : {
                question : "Are you currently taking any of the following over-the-counter medications?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            coldSores_immunocompromised : {
                question : "Are you immune deficient (or immunocompromised) in any way?", 
                options  : [
                    'Yes',
                    'No'
                ]
            }
        }
    },
    HAIR: {
        QUESTIONS:{
            chairLoss_hairLoss_age: {
                question : "At what age did you first start noticing hair loss?",
                options  : [
                    'Less than 18 year',
                    'In between 19 to 30',
                    'Above 30'
                ]
            },
            chairLoss_hairLoss_logn_age: {
                question : "How long ago did you first notice any signs of hair loss?",
                options  : [
                    'Less than 18 year',
                    'In between 19 to 30',
                    'Above 30'
                ]
            },
            hairLoss_hairLoss_at: {
                question : "I have experienced the following hair loss symptoms (select those that apply):",
                options  : [
                    'Circular or patchy bold spot',
                    'Sudden loosening of hair',
                    'Full-body hair loss',
                    'Patches of scaling that spread over the scalp'
                ]
            },
            hairLoss_hormonal_agents : {
                question : "Have you ever been formally treated for hair loss?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            hairLoss_cosmetics: {
                question : "Do you have a family history of hair loss?",
                options  : [
                    'Yes',
                    'No'
                ] 
            },
            hairloss_bllod_pressure: {
                question : "Please tell us which family members experienced hair loss?",
                options  : [
                    'Father',
                    'Grand Father',
                    'Other'
                ]
            },
            Effectiveness_of_treatment_used : {
                question : "Any following treatments have you used for hair loss?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            shampoo_used_in_last_12months: {
                question : "Please list shampoos that you have used in past 12 months:",
                options  : [
                    'Minoxifin',
                    'Reinforcing & Nourishing',
                    'Herbs Shampoos',
                    'Aloe vera',
                    'Others'
                ]
            },
            hairLoss_surgeries_status : {
                question : "Do you have any medical conditions or a history of prior surgeries?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            hairLoss_surgeries : {
                question : "Do you have any medical conditions or a history of prior surgeries?", 
                options  : [
                    'Yes',
                    'No'
                ]
            },
            experienced_symptoms: {
                question : "Have you experienced any of the following conditions, events or symptoms?", 
                options  : [
                    'Yes',
                    'No'
                ]
            }
        }
    },
    DEFAULT: {
        QUESTIONS:{
            doctor_help: {
                question : "The Doctor can help. Just a couple quick questions before I transfer you. What are all your symptoms? Are you currently using any medications?",
                options  : [
                    'Yes',
                    'No'
                ]
            },
            age: {
                question : "What's your age?",
                options  : [
                    'Below 18',
                    'In between 18 to 30',
                    'Above 30'
                ]
            },
            gender: {
                question : "What's your gender",
                options  : [
                    'Male',
                    'Female'
                ]
            },
            history   : {
                question : "Anything else in your medical history you think the Doctor should know?", 
                options  : [
                    'Yes',
                    'No'
                ]
            },
            got_it: {
                question : "OK. Got it. You wan't call with Doctor",
                options  : [
                    'Yes',
                    'No'
                ]
            }
        }
    }
};

exports.FORMS = Object.freeze(FORMS);
