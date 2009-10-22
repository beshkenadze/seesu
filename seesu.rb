require 'rubygems'
require 'sinatra'
require 'json'
require 'dm-core'
require 'do_sqlite3'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, 'views'

mime :json, 'appliaction/json'

DataMapper.setup :default, ENV['DATABASE_URL'] || 'sqlite3://my.db'

class UsageInfo
  include DataMapper::Resource

  property :id,          Integer, :serial => true
  property :hash,        String
  property :version,     String
  property :when,        DateTime
  property :demension_x, Integer
  property :demension_y, Integer
end

DataMapper.auto_migrate!

get '/' do
  "Hi, I'm Seesu server. Nice to meet you!"
end

post '/update' do

  info = UsageInfo.new (
    :hash => params[:hash],
    :version => params[:version],
    :when => Time.now,
    :demension_x => params[:demension_x],
    :demension_y => params[:demension_y]
  )
  
  info.save

  content_type :json
  
  {
    :latest_version => {
      :number   => '0.2',
      :link     => 'seesu.wgt'
    }, 
    
    :inviters => {
    
      :yodapunk => {
        :count  => 0,
        :link   => "http://vk.com/reg....",
        :select => true
      },
      
      :kossnocorp => {
        :count  => 12,
        :link   => 'http://vk.com/reg....',
        :select => false
      }, 
      
      :porqz => {
        :count  => 0,
        :link   => "http://vk.com/reg....",
        :select => false
      },
      
      :elv1s => {
        :count  => 0,
        :link   => "http://vk.com/reg....",
        :select => false
      }    
    },
    
    :promo => {
      :text     => "blabla",
      :lang     => "en",
      :number   => 22,
      :until    => "2009.10.25"
    }
  }.to_json
end
