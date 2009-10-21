require 'rubygems'
require 'sinatra'
require 'json'
require 'dm-core'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, 'views'

mime :json, 'appliaction/json'

DataMapper.setup :default, ENV['DATABASE_URL'] || 'sqlite3://my.db'

class UsageInfo
  include DataMapper::Resource

  property :hash,    String
  property :version, String
  property :when,    DateTime
end


get '/' do
  "Hi, I'm Seesu server. Nice to meet you!"
end

post '/update' do

  content_type :json
  
  { 
    :latest_version => '0.0',
    :message => {
      :title => 'Hi!',
      :body => 'Hello cruel world!'
    }
  }.to_json
end
