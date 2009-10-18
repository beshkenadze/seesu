require 'rubygems'
require 'sinatra'
require 'json'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, 'views'
set :public, 'public'

mime :json, 'appliaction/json'

get '/' do
  "Bro, you wanna susi?! Ha?!"
end

get '/updates/:current_version' do
  content_type :json
  
  { 
    :latest_version => '0.0',
    :message => {
      :title => 'Hi!',
      :body => 'Hello cruel world!'
    }
  }.to_json
end
