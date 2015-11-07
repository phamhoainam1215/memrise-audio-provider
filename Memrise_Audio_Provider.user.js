// ==UserScript==
// @name           Memrise Audio Provider
// @namespace      https://github.com/cooljingle
// @description    Provides generated audio from google's TTS api 
// @match          http://www.memrise.com/course/*/garden/*
// @match          http://www.memrise.com/garden/review/*
// @version        0.0.2
// @updateURL      https://github.com/cooljingle/memrise-audio-provider/raw/master/Memrise_Audio_Provider.user.js
// @downloadURL    https://github.com/cooljingle/memrise-audio-provider/raw/master/Memrise_Audio_Provider.user.js
// @grant          none
// ==/UserScript==

$(document).ready(function() {
    var audioPlaying = false,
        courseId,
        language,
        localStorageIdentifier = "memrise-audio-provider",
        savedChoices = JSON.parse(localStorage.getItem(localStorageIdentifier)) || {},
        word,
        wordColumn = 1;

    $('#left-area').append("<a id='audio-provider-link'>Audio Provider</a><div id='audio-provider-box' style='display:none'><em style='font-size:85%' id='audio-provider-text'></em><select id='audio-provider-options'></select></div>");
    $('#audio-provider-link').click(function() {
        $('#audio-provider-text').text("audio for this course:");
        $('#audio-provider-box').toggle();
    });

    //required to get google's tts working
    var meta = document.createElement('meta');
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.getElementsByTagName('head')[0].appendChild(meta);

    MEMRISE.garden.boxes.load = (function() {
        var cached_function = MEMRISE.garden.boxes.load;
        return function() {
            var result = cached_function.apply(this, arguments);
            language = MEMRISE.garden.session.category.name;
            
            _.each(MEMRISE.garden.box_types, function(box_type){
                box_type.prototype.activate = (function() {
                    var cached_function = box_type.prototype.activate;
                    return function() {
                        var newCourseId = getCourseId(this);
                        if (courseId !== newCourseId) {
                            courseId = newCourseId;
                            editAudioOptions(this);
                        }
                        if(wordColumn > 0) {
                            injectAudioIfRequired(this);
                            word = this.thing.columns[wordColumn].val;
                        }
                        var result = cached_function.apply(this, arguments);
                        return result;
                    };
                }());
            })

            MEMRISE.renderer.fixMediaUrl = (function() {
                var cached_function = MEMRISE.renderer.fixMediaUrl;
                return function() {
                    if (arguments[0] === "AUDIO_PROVIDER") {
                        return "";
                    } else {
                        return cached_function.apply(this, arguments);
                    }
                };
            }());

            MEMRISE.audioPlayer.play = (function() {
                var cached_function = MEMRISE.audioPlayer.play;
                return function() {
                    var shouldGenerateAudio = (arguments[0].url === "");
                    if (shouldGenerateAudio && !audioPlaying) {
                        playGeneratedAudio();
                    } else {
                        cached_function.apply(this, arguments);
                    }
                };
            }());

            return result;
        };
    }());

    function editAudioOptions(context) {
        $('#audio-provider-options').empty();
        var columns = context.pool.columns;
        _.each($.extend({0: {kind: "text", label: "No audio"}}, columns), function(v, k) {
            if (v.kind === "text") {
                $('#audio-provider-options').append('<option value="' + k + '">' + v.label + '</option>');
            }
        });
        wordColumn = savedChoices[courseId] || 1;
        $('#audio-provider-options').val(savedChoices[courseId] || 1);
        $('#audio-provider-options').change(function() {
            wordColumn = $(this).val();
            savedChoices[courseId] = wordColumn;
            localStorage.setItem(localStorageIdentifier, JSON.stringify(savedChoices));
            if(wordColumn > 0) {
                word = context.thing.columns[wordColumn].val;
            }
        });
    }

    function getAudioColumn(context) {
        var audioColumnNumber = _.findKey(context.pool.columns, function(c) {
            return c.kind === "audio";
        });
        return context.thing.columns[audioColumnNumber];
    }

    function getCourseId(context) {
        return context.course_id || MEMRISE.garden.session_params.course_id || MEMRISE.garden.session_data.thinguser_course_ids[context.thing_id + "-" + context.column_a + "-" + context.column_b];
    }
    
    function injectAudioIfRequired(context) {
        var column = getAudioColumn(context);
        if (column.val.length === 0) {
            column.val.push({
                url: "AUDIO_PROVIDER",
                id: 1
            });
        }
    }

    var languageCodes = {
        "Afrikaans": "af",
        "Albanian": "sq",
        "Amharic": "am",
        "Arabic": "ar",
        "Armenian": "hy",
        "Azerbaijani": "az",
        "Basque": "eu",
        "Belarusian": "be",
        "Bengali": "bn",
        "Bihari": "bh",
        "Bosnian": "bs",
        "Breton": "br",
        "Bulgarian": "bg",
        "Cambodian": "km",
        "Catalan": "ca",
        "Mandarin Chinese (Simplified)": "zh-CN",
        "Chinese (Traditional)": "zh-TW",
        "Corsican": "co",
        "Croatian": "hr",
        "Czech": "cs",
        "Danish": "da",
        "Dutch": "nl",
        "English": "en",
        "Esperanto": "eo",
        "Estonian": "et",
        "Faroese": "fo",
        "Filipino": "tl",
        "Finnish": "fi",
        "French": "fr",
        "Frisian": "fy",
        "Galician": "gl",
        "Georgian": "ka",
        "German": "de",
        "Greek": "el",
        "Guarani": "gn",
        "Gujarati": "gu",
        "Hausa": "ha",
        "Hebrew": "iw",
        "Hindi": "hi",
        "Hungarian": "hu",
        "Icelandic": "is",
        "Indonesian": "id",
        "Interlingua": "ia",
        "Irish": "ga",
        "Italian": "it",
        "Japanese": "ja",
        "Javanese": "jw",
        "Kannada": "kn",
        "Kazakh": "kk",
        "Kinyarwanda": "rw",
        "Kirundi": "rn",
        "Korean": "ko",
        "Kurdish": "ku",
        "Kyrgyz": "ky",
        "Laothian": "lo",
        "Latin": "la",
        "Latvian": "lv",
        "Lingala": "ln",
        "Lithuanian": "lt",
        "Macedonian": "mk",
        "Malagasy": "mg",
        "Malay": "ms",
        "Malayalam": "ml",
        "Maltese": "mt",
        "Maori": "mi",
        "Marathi": "mr",
        "Moldavian": "mo",
        "Mongolian": "mn",
        "Montenegrin": "sr-ME",
        "Nepali": "ne",
        "Norwegian": "no",
        "Norwegian (Nynorsk)": "nn",
        "Occitan": "oc",
        "Oriya": "or",
        "Oromo": "om",
        "Pashto": "ps",
        "Persian": "fa",
        "Polish": "pl",
        "Portuguese (Brazil)": "pt-BR",
        "Portuguese (Portugal)": "pt-PT",
        "Punjabi": "pa",
        "Quechua": "qu",
        "Romanian": "ro",
        "Romansh": "rm",
        "Russian": "ru",
        "Scots Gaelic": "gd",
        "Serbian": "sr",
        "Serbo-Croatian": "sh",
        "Sesotho": "st",
        "Shona": "sn",
        "Sindhi": "sd",
        "Sinhalese": "si",
        "Slovak": "sk",
        "Slovenian": "sl",
        "Somali": "so",
        "Spanish": "es",
        "Sundanese": "su",
        "Swahili": "sw",
        "Swedish": "sv",
        "Tajik": "tg",
        "Tamil": "ta",
        "Tatar": "tt",
        "Telugu": "te",
        "Thai": "th",
        "Tigrinya": "ti",
        "Tonga": "to",
        "Turkish": "tr",
        "Turkmen": "tk",
        "Twi": "tw",
        "Uighur": "ug",
        "Ukrainian": "uk",
        "Urdu": "ur",
        "Uzbek": "uz",
        "Vietnamese": "vi",
        "Welsh": "cy",
        "Xhosa": "xh",
        "Yiddish": "yi",
        "Yoruba": "yo",
        "Zulu": "zu"
    };

    function playGeneratedAudio() {
        var audioElement = document.createElement('audio'),
            encodedWord = encodeURIComponent(word),
            languageCode = languageCodes[language],
            tk = Math.floor(Math.random() * 1000000); //helps stop google from complaining about too many requests
        audioLink = "http://translate.google.com/translate_tts?ie=UTF-8&tl=" + languageCode + "&client=t&q=" + encodedWord + "&tk=" + tk;
        audioElement.setAttribute('src', audioLink);
        audioElement.play();
        audioPlaying = true;
        $(audioElement).on('ended', function() {
            audioPlaying = false;
        });
    }
});
