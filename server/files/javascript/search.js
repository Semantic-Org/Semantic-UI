semantic.search = {};

// ready event
semantic.search.ready = function() {

  // selector cache
  var
    $local    = $('.local .ui.search'),
    $external = $('.external.example .ui.search'),
    $mapping  = $('.mapping .ui.search'),
    $standard = $('.standard .ui.search'),
    $category = $('.category .ui.search'),

    content,
    // alias
    handler
  ;

  content = [
    { title: 'Andorra' },
    { title: 'United Arab Emirates' },
    { title: 'Afghanistan' },
    { title: 'Antigua' },
    { title: 'Anguilla' },
    { title: 'Albania' },
    { title: 'Armenia' },
    { title: 'Netherlands Antilles' },
    { title: 'Angola' },
    { title: 'Argentina' },
    { title: 'American Samoa' },
    { title: 'Austria' },
    { title: 'Australia' },
    { title: 'Aruba' },
    { title: 'Aland Islands' },
    { title: 'Azerbaijan' },
    { title: 'Bosnia' },
    { title: 'Barbados' },
    { title: 'Bangladesh' },
    { title: 'Belgium' },
    { title: 'Burkina Faso' },
    { title: 'Bulgaria' },
    { title: 'Bahrain' },
    { title: 'Burundi' },
    { title: 'Benin' },
    { title: 'Bermuda' },
    { title: 'Brunei' },
    { title: 'Bolivia' },
    { title: 'Brazil' },
    { title: 'Bahamas' },
    { title: 'Bhutan' },
    { title: 'Bouvet Island' },
    { title: 'Botswana' },
    { title: 'Belarus' },
    { title: 'Belize' },
    { title: 'Canada' },
    { title: 'Cocos Islands' },
    { title: 'Congo' },
    { title: 'Central African Republic' },
    { title: 'Congo Brazzaville' },
    { title: 'Switzerland' },
    { title: 'Cote Divoire' },
    { title: 'Cook Islands' },
    { title: 'Chile' },
    { title: 'Cameroon' },
    { title: 'China' },
    { title: 'Colombia' },
    { title: 'Costa Rica' },
    { title: 'Serbia' },
    { title: 'Cuba' },
    { title: 'Cape Verde' },
    { title: 'Christmas Island' },
    { title: 'Cyprus' },
    { title: 'Czech Republic' },
    { title: 'Germany' },
    { title: 'Djibouti' },
    { title: 'Denmark' },
    { title: 'Dominica' },
    { title: 'Dominican Republic' },
    { title: 'Algeria' },
    { title: 'Ecuador' },
    { title: 'Estonia' },
    { title: 'Egypt' },
    { title: 'Western Sahara' },
    { title: 'Eritrea' },
    { title: 'Spain' },
    { title: 'Ethiopia' },
    { title: 'European Union' },
    { title: 'Finland' },
    { title: 'Fiji' },
    { title: 'Falkland Islands' },
    { title: 'Micronesia' },
    { title: 'Faroe Islands' },
    { title: 'France' },
    { title: 'Gabon' },
    { title: 'England' },
    { title: 'Grenada' },
    { title: 'Georgia' },
    { title: 'French Guiana' },
    { title: 'Ghana' },
    { title: 'Gibraltar' },
    { title: 'Greenland' },
    { title: 'Gambia' },
    { title: 'Guinea' },
    { title: 'Guadeloupe' },
    { title: 'Equatorial Guinea' },
    { title: 'Greece' },
    { title: 'Sandwich Islands' },
    { title: 'Guatemala' },
    { title: 'Guam' },
    { title: 'Guinea-Bissau' },
    { title: 'Guyana' },
    { title: 'Hong Kong' },
    { title: 'Heard Island' },
    { title: 'Honduras' },
    { title: 'Croatia' },
    { title: 'Haiti' },
    { title: 'Hungary' },
    { title: 'Indonesia' },
    { title: 'Ireland' },
    { title: 'Israel' },
    { title: 'India' },
    { title: 'Indian Ocean Territory' },
    { title: 'Iraq' },
    { title: 'Iran' },
    { title: 'Iceland' },
    { title: 'Italy' },
    { title: 'Jamaica' },
    { title: 'Jordan' },
    { title: 'Japan' },
    { title: 'Kenya' },
    { title: 'Kyrgyzstan' },
    { title: 'Cambodia' },
    { title: 'Kiribati' },
    { title: 'Comoros' },
    { title: 'Saint Kitts and Nevis' },
    { title: 'North Korea' },
    { title: 'South Korea' },
    { title: 'Kuwait' },
    { title: 'Cayman Islands' },
    { title: 'Kazakhstan' },
    { title: 'Laos' },
    { title: 'Lebanon' },
    { title: 'Saint Lucia' },
    { title: 'Liechtenstein' },
    { title: 'Sri Lanka' },
    { title: 'Liberia' },
    { title: 'Lesotho' },
    { title: 'Lithuania' },
    { title: 'Luxembourg' },
    { title: 'Latvia' },
    { title: 'Libya' },
    { title: 'Morocco' },
    { title: 'Monaco' },
    { title: 'Moldova' },
    { title: 'Montenegro' },
    { title: 'Madagascar' },
    { title: 'Marshall Islands' },
    { title: 'MacEdonia' },
    { title: 'Mali' },
    { title: 'Burma' },
    { title: 'Mongolia' },
    { title: 'MacAu' },
    { title: 'Northern Mariana Islands' },
    { title: 'Martinique' },
    { title: 'Mauritania' },
    { title: 'Montserrat' },
    { title: 'Malta' },
    { title: 'Mauritius' },
    { title: 'Maldives' },
    { title: 'Malawi' },
    { title: 'Mexico' },
    { title: 'Malaysia' },
    { title: 'Mozambique' },
    { title: 'Namibia' },
    { title: 'New Caledonia' },
    { title: 'Niger' },
    { title: 'Norfolk Island' },
    { title: 'Nigeria' },
    { title: 'Nicaragua' },
    { title: 'Netherlands' },
    { title: 'Norway' },
    { title: 'Nepal' },
    { title: 'Nauru' },
    { title: 'Niue' },
    { title: 'New Zealand' },
    { title: 'Oman' },
    { title: 'Panama' },
    { title: 'Peru' },
    { title: 'French Polynesia' },
    { title: 'New Guinea' },
    { title: 'Philippines' },
    { title: 'Pakistan' },
    { title: 'Poland' },
    { title: 'Saint Pierre' },
    { title: 'Pitcairn Islands' },
    { title: 'Puerto Rico' },
    { title: 'Palestine' },
    { title: 'Portugal' },
    { title: 'Palau' },
    { title: 'Paraguay' },
    { title: 'Qatar' },
    { title: 'Reunion' },
    { title: 'Romania' },
    { title: 'Serbia' },
    { title: 'Russia' },
    { title: 'Rwanda' },
    { title: 'Saudi Arabia' },
    { title: 'Solomon Islands' },
    { title: 'Seychelles' },
    { title: 'Sudan' },
    { title: 'Sweden' },
    { title: 'Singapore' },
    { title: 'Saint Helena' },
    { title: 'Slovenia' },
    { title: 'Svalbard, I Flag Jan Mayen' },
    { title: 'Slovakia' },
    { title: 'Sierra Leone' },
    { title: 'San Marino' },
    { title: 'Senegal' },
    { title: 'Somalia' },
    { title: 'Suriname' },
    { title: 'Sao Tome' },
    { title: 'El Salvador' },
    { title: 'Syria' },
    { title: 'Swaziland' },
    { title: 'Caicos Islands' },
    { title: 'Chad' },
    { title: 'French Territories' },
    { title: 'Togo' },
    { title: 'Thailand' },
    { title: 'Tajikistan' },
    { title: 'Tokelau' },
    { title: 'Timorleste' },
    { title: 'Turkmenistan' },
    { title: 'Tunisia' },
    { title: 'Tonga' },
    { title: 'Turkey' },
    { title: 'Trinidad' },
    { title: 'Tuvalu' },
    { title: 'Taiwan' },
    { title: 'Tanzania' },
    { title: 'Ukraine' },
    { title: 'Uganda' },
    { title: 'Us Minor Islands' },
    { title: 'United States' },
    { title: 'Uruguay' },
    { title: 'Uzbekistan' },
    { title: 'Vatican City' },
    { title: 'Saint Vincent' },
    { title: 'Venezuela' },
    { title: 'British Virgin Islands' },
    { title: 'Us Virgin Islands' },
    { title: 'Vietnam' },
    { title: 'Vanuatu' },
    { title: 'Wallis and Futuna' },
    { title: 'Samoa' },
    { title: 'Yemen' },
    { title: 'Mayotte' },
    { title: 'South Africa' },
    { title: 'Zambia' },
    { title: 'Zimbabwe' }
  ];

  $local
    .search({
      searchFields: ['title'],
      source: content
    })
  ;

  $standard
    .search()
  ;

  $category
    .search({
      type: 'category',
      apiSettings: {
        action: 'categorySearch'
      }
    })
  ;

  // mapping example
  $mapping
    .search({
      apiSettings: {
        url: '//api.github.com/search/repositories?q={query}',
        cache: true
      },
      fields: {
        results : 'items',
        title   : 'name',
        url     : 'html_url'
      },
      minCharacters : 3
    })
  ;

  // api mod
  $external
    .search({
      type          : 'category',
      minCharacters : 3,
      apiSettings   : {
        onFailure: function() {
          $(this).search('display message', '<b>Hold off a few minutes</b> <div class="ui divider"></div> GitHub rate limit exceeded for anonymous search.');
        },
        onResponse: function(githubResponse) {
          var
            response = {
              results : {}
            }
          ;
          if(githubResponse.items.length === 0) {
            // no results
            return response;
          }
          $.each(githubResponse.items, function(index, item) {
            var
              language  = item.language || 'Unknown',
              maxLength = 200,
              description
            ;
            if(index >= 8) {
              // only show 8 results
              return false;
            }
            // Create new language category
            if(response.results[language] === undefined) {
              response.results[language] = {
                name    : language,
                results : []
              };
            }
            description = (item.description < maxLength)
                ? item.description
                : item.description.substr(0, maxLength) + '...'
            ;
            description = $.fn.search.settings.templates.escape(description);
            // Add result to category
            response.results[language].results.push({
              title       : item.name,
              description : description,
              url         : item.html_url
            });
          });
          return response;
        },
        url: '//api.github.com/search/repositories?q={query}'
      }
    })
  ;


};


// attach ready event
$(document)
  .ready(semantic.search.ready)
;