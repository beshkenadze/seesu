require 'rubygems'
require 'sinatra'
require 'json'
require 'dm-core'
require 'do_sqlite3'

set :app_file, __FILE__
set :root, File.dirname(__FILE__)
set :views, 'views'

mime :json,   'appliaction/json'
mime :widget, 'application/x-opera-widgets'

DataMapper.setup :default, ENV['DATABASE_URL'] || 'sqlite3://my.db'

class UsageInfo
  include DataMapper::Resource

  property :id,          Integer, :serial => true
  property :hash,        String
  property :version,     String
  property :agent,       Text
  property :referer,     String
  property :accept,      Text
  property :ip,          String
  property :when,        DateTime
  property :demension_x, Integer
  property :demension_y, Integer  
  
  auto_upgrade!
end


class DownloadCount
  include DataMapper::Resource
  
  property :id,          Integer, :serial => true
  property :agent,       Text
  property :accept,      Text
  property :http_referer, Text
  property :ip,          String
  property :when,        DateTime
  
  auto_upgrade!
end

DataMapper.auto_migrate!
DataMapper.auto_upgrade!

get '/' do
  "Hi, I'm Seesu server. Nice to meet you!"
end

post '/update' do
 
  inviters = {

    :yodapunk => {
      :count  => 0,
      :link   => 'http://vk.com/reg198193',
      :select => true
    },
    
    :kossnocorp => {
      :count  => 0,
      :link   => 'http://vk.com/reg37829378',
      :select => true
    }, 
    
    :porqz => {
      :count  => 0,
      :link   => 'http://vk.com/reg668467',
      :select => true
    },
    
    :elv1s => {
      :count  => 0,
      :link   => 'http://vk.com/reg1114384',
      :select => true
    }    
  }
  
  referer = :yodapunk
  
  info = UsageInfo.new(
    :hash => params[:hash],
    :version => params[:version],

    :agent => @env['HTTP_USER_AGENT'],
    :referer => referer.to_s,
    :accept => @env['HTTP_ACCEPT_LANGUAGE'],
    
    :ip => @env['REMOTE_ADDR'],
    
    :when => Time.now,
    :demension_x => params[:demension_x],
    :demension_y => params[:demension_y]
  )
  
  info.save

  content_type :json
  
  {
    :latest_version => {
      :number   => '0.1',
      :link     => '#'
    }, 
    
    :vk_referer => inviters[referer][:link],
    
    :promo => {
      :text     => '',
      :lang     => '',
      :number   => 0,
      :until    => Time.now
    }
  }.to_json
end

get '/log' do
  log_html = '<table><tr>' +
             '<td>hash</td>' +
             '<td>version</td>' +
             '<td>width</td>' +
             '<td>heigth</td>' +
             
             '<td>agent</td>' +
             '<td>referer</td>' +
             '<td>accept</td>' +
             '<td>ip</td>' +
             
             '<td>when</td></tr>'

  UsageInfo.all.each do |usage_info|
    
    log_html += 
      "<tr><td>#{usage_info.hash}</td><td>#{usage_info.version}</td>"+
      "<td>#{usage_info.demension_x}</td><td>#{usage_info.demension_y}</td>" +
      "<td>#{usage_info.agent}</td><td>#{usage_info.referer}</td>" +
      "<td>#{usage_info.accept}</td><td>#{usage_info.ip}</td>" +
      "<td>#{usage_info.when}</td></tr>"
  
  end
  
  log_html += '</table>'
  log_html
end

get '/debug' do
  @env.inspect
end

get '/downloads/seesu.wgt' do
  content_type :widget
  
  counter = DownloadCount.new(
    :agent => @env['HTTP_USER_AGENT'],
    :accept => @env['HTTP_ACCEPT_LANGUAGE'],    
    :ip => @env['REMOTE_ADDR'],
    :http_referer => @env['HTTP_REFERER'],
    :when => Time.now  
  )
  
  counter.save
  
  File.open("#{File.dirname(__FILE__)}/seesu.wgt", 'rb').read
end
